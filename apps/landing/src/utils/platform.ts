export type Platform = "macos" | "windows" | "linux";

export function getPlatformFromOS(os: string | undefined): Platform | null {
  if (os === "macOS") return "macos";

  if (
    [
      "Arch",
      "CentOS",
      "Chrome OS",
      "Debian",
      "Deepin",
      "elementary OS",
      "Fedora",
      "Gentoo",
      "Linpus",
      "Linspire",
      "Linux",
      "Mageia",
      "Mandriva",
      "Manjaro",
      "Mint",
      "PCLinuxOS",
      "Raspbian",
      "RedHat",
      "Sabayon",
      "Slackware",
      "SUSE",
      "Ubuntu",
      "Ubuntu Touch",
      "VectorLinux",
      "Xubuntu",
      "Zenwalk",
    ].includes(os || "")
  )
    return "linux";

  if (os?.includes("Windows")) return "windows";
  return null;
}
