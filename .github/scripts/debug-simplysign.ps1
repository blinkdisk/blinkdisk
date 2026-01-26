# Debug SimplySign Authentication
# Run this right after connect-simplysign.ps1 to diagnose authentication issues

Write-Host "=== SIMPLYSIGN AUTHENTICATION DEBUG ==="
Write-Host ""

# Check process state
Write-Host "SimplySign Process Status:"
$proc = Get-Process -Name "*SimplySign*" -ErrorAction SilentlyContinue
if ($proc) {
    Write-Host "  Process found: $($proc.Name) (PID: $($proc.Id))"
    Write-Host "  Main Window Title: $($proc.MainWindowTitle)"
    Write-Host "  Responding: $($proc.Responding)"
    Write-Host "  Start Time: $($proc.StartTime)"

    # Check for error dialogs
    Write-Host ""
    Write-Host "  Window handles:"
    Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder text, int count);
}
"@
    $hwnd = [Win32]::GetForegroundWindow()
    $title = New-Object System.Text.StringBuilder(256)
    [Win32]::GetWindowText($hwnd, $title, $title.Capacity) | Out-Null
    Write-Host "  Foreground Window: $($title.ToString())"
} else {
    Write-Host "  ERROR: SimplySign process not found!"
    Write-Host "  Authentication may have failed and app closed"
}

Write-Host ""
Write-Host "=== Checking Application Logs ==="

$logPaths = @(
    "$env:LOCALAPPDATA\Certum\SimplySign Desktop\logs",
    "$env:APPDATA\Certum\SimplySign Desktop\logs",
    "C:\ProgramData\Certum\SimplySign Desktop\logs"
)

foreach ($path in $logPaths) {
    if (Test-Path $path) {
        Write-Host "  Logs found at: $path"
        $latestLog = Get-ChildItem $path -Filter "*.log" -ErrorAction SilentlyContinue |
                     Sort-Object LastWriteTime -Descending |
                     Select-Object -First 1

        if ($latestLog) {
            Write-Host "  Latest log: $($latestLog.Name) (Modified: $($latestLog.LastWriteTime))"
            Write-Host "  Last 20 lines:"
            Get-Content $latestLog.FullName -Tail 20 | ForEach-Object { Write-Host "    $_" }
        }
    }
}

Write-Host ""
Write-Host "=== PKCS#11 Module Status ==="
$pkcsPath = "$env:SystemRoot\System32\SimplySignPKCS.dll"
if (Test-Path $pkcsPath) {
    Write-Host "  PKCS#11 module present: $pkcsPath"
} else {
    Write-Host "  PKCS#11 module NOT found"
}

Write-Host ""
Write-Host "=== Certificate Store Quick Check ==="
$certs = Get-ChildItem -Path "Cert:\CurrentUser\My" -ErrorAction SilentlyContinue |
         Where-Object { $_.Subject -like "*Certum*" -or $_.Issuer -like "*Certum*" }

if ($certs) {
    Write-Host "  Certum certificates found: $($certs.Count)"
    $certs | ForEach-Object {
        Write-Host "    Subject: $($_.Subject)"
        Write-Host "    Has Private Key: $($_.HasPrivateKey)"
        Write-Host "    Thumbprint: $($_.Thumbprint)"
    }
} else {
    Write-Host "  No Certum certificates in Current User\My store"
}

Write-Host ""
Write-Host "=== Testing PKCS#11 Token Access ==="
try {
    Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Pkcs11Test {
    [DllImport("SimplySignPKCS.dll", CharSet = CharSet.Ansi)]
    public static extern uint C_GetFunctionList(IntPtr ppFunctionList);
}
"@ -ErrorAction SilentlyContinue

    if (Get-Command "Pkcs11Test" -ErrorAction SilentlyContinue) {
        Write-Host "  PKCS#11 DLL can be loaded"
    } else {
        Write-Host "  Could not load PKCS#11 DLL"
    }
} catch {
    Write-Host "  PKCS#11 test failed: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== Registry Settings Verification ==="
$regPath = "HKCU:\Software\Certum\SimplySign"
if (Test-Path $regPath) {
    Write-Host "  Registry path exists"
    Get-ItemProperty $regPath -ErrorAction SilentlyContinue |
        Select-Object ShowLoginDialogOnStart, RememberLastUserName |
        Format-List
} else {
    Write-Host "  Registry path NOT found: $regPath"
}

Write-Host ""
Write-Host "=== DEBUG COMPLETE ==="
