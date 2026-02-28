import "@electron/deeplink";
import "@electron/instance";
import "@electron/ipc";
import "@electron/log";
import "@electron/startup";
import "@electron/updater";

import { registerProtocol } from "@electron/protocol";
import { createTray } from "@electron/tray";
import { startAllVaults, stopAllVaults } from "@electron/vault/manage";
import { createWindow } from "@electron/window";
import { app } from "electron";

app.on("ready", () => {
  registerProtocol();
  createTray();

  startAllVaults();

  if (process.argv.includes("--hidden")) return;
  createWindow();
});

app.on("will-quit", function () {
  stopAllVaults();
});

// Prevents the app from quitting when all windows are closed
app.on("window-all-closed", () => null);
