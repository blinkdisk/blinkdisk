// App should be imported before sentry
import { app } from "electron";
// But sentry should be imported directly after
import { listenProtocol, registerProtcol } from "@electron/protocol";
import * as Sentry from "@sentry/electron/main";

Sentry.init({
  dsn: process.env.SENTRY_DESKTOP_DSN,
});

// Registering must happen after Sentry,
// but before the app ready event.
registerProtcol();

import "@electron/deeplink";
import "@electron/instance";
import "@electron/ipc";
import "@electron/log";
import "@electron/startup";
import "@electron/updater";

import { createTray } from "@electron/tray";
import { startAllVaults, stopAllVaults } from "@electron/vault/manage";
import { createWindow } from "@electron/window";

app.on("ready", () => {
  listenProtocol();
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
