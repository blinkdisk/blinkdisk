import "@electron/deeplink";
import "@electron/instance";
import "@electron/ipc";
import "@electron/log";
import "@electron/startup";
import "@electron/updater";

import { registerProtocol } from "@electron/protocol";
import { createTray } from "@electron/tray";
import { Vault } from "@electron/vault";
import { createWindow } from "@electron/window";
import { app } from "electron";

app.on("ready", () => {
  registerProtocol();
  createTray();

  Vault.initAll();

  if (process.argv.includes("--hidden")) return;
  createWindow();
});

app.on("will-quit", function () {
  Vault.stopAll();
});

// Prevents the app from quitting when all windows are closed
app.on("window-all-closed", () => null);
