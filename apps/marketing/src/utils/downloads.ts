export const linux = {
  deb: {
    arm64: "BlinkDisk-Linux-arm64.deb",
    armv7l: "BlinkDisk-Linux-armv7l.deb",
    x86_64: "BlinkDisk-Linux-amd64.deb",
  },
  rpm: {
    arm64: "BlinkDisk-Linux-aarch64.rpm",
    armv7l: "BlinkDisk-Linux-armv7l.rpm",
    x86_64: "BlinkDisk-Linux-x86_64.rpm",
  },
  AppImage: {
    arm64: "BlinkDisk-Linux-arm64.AppImage",
    armv7l: "BlinkDisk-Linux-armv7l.AppImage",
    x86_64: "BlinkDisk-Linux-x86_64.AppImage",
  },
};

export const mac = {
  dmg: "BlinkDisk-macOS.dmg",
};

export const windows = {
  exe: "BlinkDisk-Windows.exe",
};

export function getDownloadUrl(filename: string) {
  return `https://github.com/blinkdisk/blinkdisk/releases/latest/download/${filename}`;
}
