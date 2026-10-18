$ErrorActionPreference = 'Stop'

$downloadPage = 'https://support.certum.eu/en/software/procertum-smartsign/'
$tempDirectory = if ($env:RUNNER_TEMP) { $env:RUNNER_TEMP } else { [System.IO.Path]::GetTempPath() }
$installerPath = Join-Path $tempDirectory 'SimplySignDesktop.msi'
$logPath = Join-Path $tempDirectory 'simplysign-install.log'
$exePath = 'C:\Program Files\Certum\SimplySign Desktop\SimplySignDesktop.exe'

Write-Host "Finding the latest SimplySign Desktop installer on $downloadPage"
$page = Invoke-WebRequest -Uri $downloadPage -UseBasicParsing -TimeoutSec 60

# Only accept Certum's English x64 MSI with matching directory and filename versions.
$installerPattern = 'https://files\.certum\.eu/software/SimplySignDesktop/Windows/(?<version>\d+\.\d+\.\d+\.\d+)/SimplySignDesktop-\k<version>-64-bit-en\.msi'
$installers = @([regex]::Matches($page.Content, $installerPattern) |
    Sort-Object { [version]$_.Groups['version'].Value } -Descending)
if ($installers.Count -eq 0) {
    throw "Certum's download page did not contain a Windows 64-bit English SimplySign MSI: $downloadPage"
}
$installerUrl = $installers[0].Value
$installerVersion = $installers[0].Groups['version'].Value
Write-Host "Downloading SimplySign Desktop $installerVersion from $installerUrl"
Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing -TimeoutSec 600

# Verify the signed publisher instead of pinning a checksum that prevents updates.
$signature = Get-AuthenticodeSignature -LiteralPath $installerPath
if ($signature.Status -ne 'Valid') {
    throw "SimplySign installer signature is not valid: $($signature.Status) ($($signature.StatusMessage))"
}
$publisher = $signature.SignerCertificate.GetNameInfo([System.Security.Cryptography.X509Certificates.X509NameType]::SimpleName, $false)
if ($publisher -ne 'Asseco Data Systems S.A.') {
    throw "Unexpected SimplySign installer publisher: $publisher"
}
Write-Host "Verified installer signature from $publisher"
Write-Host "Installer SHA-256: $((Get-FileHash -LiteralPath $installerPath -Algorithm SHA256).Hash)"

# Certum's executable FileVersion differs from its MSI product version.
$windowsInstaller = New-Object -ComObject WindowsInstaller.Installer
$database = $windowsInstaller.OpenDatabase($installerPath, 0)
$view = $database.OpenView("SELECT Property, Value FROM Property WHERE Property = 'ProductCode' OR Property = 'ProductVersion'")
$view.Execute()
$packageProperties = @{}
while ($record = $view.Fetch()) {
    $packageProperties[$record.StringData(1)] = $record.StringData(2)
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($record)
}
$view.Close()
[void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($view)
[void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($database)
if (-not $packageProperties.ProductCode -or -not $packageProperties.ProductVersion) {
    throw 'SimplySign installer is missing its product code or version'
}

Remove-Item -LiteralPath $logPath -Force -ErrorAction SilentlyContinue
Write-Host "Installing SimplySign Desktop $installerVersion"
$arguments = "/i `"$installerPath`" /quiet /norestart /l*v `"$logPath`" ALLUSERS=1 REBOOT=ReallySuppress"
$installer = Start-Process -FilePath 'msiexec.exe' -ArgumentList $arguments -Wait -PassThru
# Windows Installer also reports success with 3010 when a reboot is required.
if ($installer.ExitCode -notin @(0, 3010)) {
    if (Test-Path -LiteralPath $logPath) {
        Get-Content -LiteralPath $logPath -Tail 20 | Write-Host
    }
    throw "SimplySign installation failed with exit code $($installer.ExitCode). Installer log: $logPath"
}
if (-not (Test-Path -LiteralPath $exePath)) {
    throw "SimplySign installation completed but the executable was not found: $exePath"
}
$installedVersion = $windowsInstaller.GetType().InvokeMember('ProductInfo', 'GetProperty', $null, $windowsInstaller, @($packageProperties.ProductCode, 'VersionString'))
if ([version]$installedVersion -ne [version]$packageProperties.ProductVersion) {
    throw "SimplySign installation completed but the installed product version is $installedVersion, expected $($packageProperties.ProductVersion)"
}
Write-Host "SimplySign Desktop installed: $installedVersion"

if ($env:GITHUB_OUTPUT) {
    "SIMPLYSIGN_PATH=$(Split-Path -Parent $exePath)" | Out-File -FilePath $env:GITHUB_OUTPUT -Encoding utf8 -Append
}
