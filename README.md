<p align="center">
  <h2 align="center">BlinkDisk</h2>

  <p align="center">
    The easiest way to backup your files.
    <br />
    <a href="https://blinkdisk.com/?utm_source=github"><strong>Learn more</strong></a>
    &nbsp;&nbsp;|&nbsp;&nbsp;
    <a href="https://blinkdisk.com/download?utm_source=github"><strong>Download</strong></a>
</p>

<a href="https://blinkdisk.com/?utm_source=github">
  <img src="https://github.com/blinkdisk/blinkdisk/blob/main/apps/marketing/src/assets/screenshots/dark.png?raw=true" alt="BlinkDisk Banner">
</a>

## 💡 What is BlinkDisk?

BlinkDisk is a desktop application that lets you effortlessly create backups of all your important files with just a few clicks.

## ❓ Why Do I Need Backups?

Your files are more at risk than you might think. One accidental delete, a failing hard drive, or a ransomware attack can wipe out years of photos, documents, and memories in an instant.

## ☁️ But I Already Use Cloud Storage...

Cloud sync services like iCloud, OneDrive, or Google Drive aren't real backups. They only keep the latest version of each file. Delete or overwrite something, and it's gone there too. A true backup keeps multiple versions of your files over time, so you can always go back. [Read more](https://blinkdisk.com/blog/sync-vs-backup?utm_source=github)

## ✨ Features

### 🔒 End-to-End Encrypted

Your files are encrypted with your password before they ever leave your device. Not even BlinkDisk can see your data - only you have the key.

### 🙌 Built for Everyone

No technical knowledge required. Just install BlinkDisk, choose what to protect, and your first backup starts in minutes. It quietly runs in the background with no distractions.

### ⚡ File Deduplication

BlinkDisk automatically detects and stores identical files only once. This saves valuable storage space, reduces upload times, and makes every backup effortlessly fast.

### 🌍 Cross-Platform

Whether you're on Windows, macOS, or Linux, BlinkDisk keeps your files safe and synced seamlessly across all your machines.

| Platform | Supported Versions                         |
| -------- | ------------------------------------------ |
| Windows  | Windows 10/11 (64-bit)                     |
| macOS    | Big Sur and newer                          |
| Linux    | AppImage, deb, rpm (x86_64, arm64, armv7l) |

### 💾 Multiple Storage Options

#### ☁️ CloudBlink

Our managed cloud storage with a free tier and affordable subscription plans. No setup required. [See Pricing](https://blinkdisk.com/cloudblink?utm_source=github#pricing).

#### 🔧 Custom Storage

Bring your own storage for 100% free:

- Local filesystem (external hard drives, USB drives)
- Any S3-compatible storage (Wasabi, MinIO, etc.)
- Network Attached Storage (NAS)
- WebDAV
- SFTP
- Backblaze B2
- Amazon S3
- Google Cloud Storage
- Azure Blob Storage
- Any Rclone Remote

## 🚀 How It Works

1. **Choose folders to protect** - Pick all folders you want to protect. We take care of everything else.
2. **Create your first backup** - BlinkDisk starts backing up your files in the background. You'll always have secure copies.
3. **Restore any file, anytime** - When something goes wrong, simply open BlinkDisk and restore any file in seconds.

## 🛠️ Local Development

For information on how to set up a local development environment, check out the [DEVELOPMENT.md](DEVELOPMENT.md) file.

## 🙏 Credits

BlinkDisk's [core](https://github.com/blinkdisk/core) is built on top of [Kopia](https://kopia.io/), which handles the heavy lifting behind BlinkDisk.

> ❤️ **A huge thank you to the Kopia team.** This project would not be possible without their amazing work. Kopia is one of the most thoughtfully designed backup tools out there, and we're proud to build on top of it.
