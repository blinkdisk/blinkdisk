import { log } from "@electron/log";
import { sendWindow } from "@electron/window";
import { app } from "electron";
import type { ProgressInfo, UpdateInfo } from "electron-updater";
import electronUpdater from "electron-updater";

// Workaround for ESM compatibility issues
// See https://github.com/electron-userland/electron-builder/issues/7976.
const { autoUpdater } = electronUpdater;

let available: boolean = false;
let details: UpdateInfo | null = null;
let downloaded: boolean = false;
let progress: ProgressInfo | null = null;
let errored: boolean = false;

autoUpdater.on("update-available", (updateInfo) => {
  log.info("Update available", updateInfo);
  available = true;
  details = updateInfo;
  sendUpdateStatus();
});

autoUpdater.on("update-downloaded", (update) => {
  log.info("Update downloaded", update);
  downloaded = true;
  sendUpdateStatus();
});

autoUpdater.on("download-progress", (progressUpdate) => {
  log.info("Download progress", progressUpdate);
  progress = progressUpdate;
  sendUpdateStatus();
});

autoUpdater.on("error", (error) => {
  log.error("Failed to update", error);
  errored = true;
  sendUpdateStatus();
});

if (app.isPackaged) {
  function check() {
    autoUpdater.checkForUpdates();
  }

  check();
  setInterval(check, 1000 * 60 * 60);
}

export function installUpdate() {
  autoUpdater.quitAndInstall();
}

function sendUpdateStatus() {
  sendWindow("update.available", getUpdateStatus());
}

export function getUpdateStatus() {
  return {
    available,
    details,
    downloaded,
    progress,
    errored,
  };
}

export type UpdateStatus = ReturnType<typeof getUpdateStatus>;
