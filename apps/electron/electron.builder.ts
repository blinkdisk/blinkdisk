import { Configuration } from "electron-builder";

const appId = "com.blinkdisk.app";

export default {
  productName: "BlinkDisk",
  appId,
  files: ["build/**", "frontend/**"],
  directories: {
    buildResources: "icon",
  },
  publish: {
    provider: "github",
    vPrefixedTagName: true,
    releaseType: "draft",
  },
  extraResources: [
    {
      from: "assets",
      to: "./assets",
    },
  ],
  protocols: [
    {
      name: "BlinkDisk",
      schemes: ["blinkdisk"],
      role: "Editor",
    },
  ],
  // Used for MacOS .zip files
  artifactName: "BlinkDisk-MacOS.${ext}",
  win: {
    appId,
    target: ["nsis"],
    extraResources: [
      {
        from: "../core/dist/blinkdisk_windows_amd64",
        to: "./binaries",
      },
    ],
  },
  nsis: {
    artifactName: "BlinkDisk-Windows.${ext}",
  },
  mac: {
    appId,
    hardenedRuntime: true,
    notarize: true,
    category: "public.app-category.utilities",
    entitlements: "assets/entitlements.mac.plist",
    entitlementsInherit: "assets/entitlements.mac.plist",
    target: [
      {
        // zip target is required for auto updating
        target: "zip",
        arch: ["universal"],
      },
      {
        target: "dmg",
        arch: ["universal"],
      },
    ],
    x64ArchFiles: "**/blinkdisk",
    extraResources: [
      {
        from: "../core/dist/blinkdisk_darwin_universal",
        to: "./binaries",
      },
    ],
  },
  dmg: {
    artifactName: "BlinkDisk-macOS.${ext}",
  },
  linux: {
    appId,
    category: "Utility",
    executableName: "blinkdisk",
    target: [
      {
        target: "AppImage",
        arch: ["x64", "arm64", "armv7l"],
      },
      {
        target: "deb",
        arch: ["x64", "arm64", "armv7l"],
      },
      {
        target: "rpm",
        arch: ["x64", "arm64", "armv7l"],
      },
    ],
    extraResources: [
      {
        from: "../core/dist/blinkdisk_linux_${arch}",
        to: "./binaries",
      },
    ],
  },
  rpm: {
    artifactName: "BlinkDisk-Linux-${arch}.${ext}",
  },
  deb: {
    artifactName: "BlinkDisk-Linux-${arch}.${ext}",
  },
  appImage: {
    artifactName: "BlinkDisk-Linux-${arch}.${ext}",
  },
  extraMetadata: {
    name: "blinkdisk",
    homepage: "https://blinkdisk.com",
    version: process.env.GITHUB_REF_NAME?.replace("v", ""),
  },
} satisfies Configuration;
