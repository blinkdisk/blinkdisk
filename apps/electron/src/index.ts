// App should be imported before sentry
import { app } from "electron";
// But sentry should be imported directly after
import { listenProtocol, registerProtcol } from "#protocol";
import * as Sentry from "@sentry/electron/main";

Sentry.init({
  dsn: process.env.SENTRY_DESKTOP_DSN,
  enabled: process.env.NODE_ENV !== "development",
});

// Registering must happen after Sentry,
// but before the app ready event.
registerProtcol();

import "#deeplink";
import "#instance";
import "#ipc";
import "#log";
import "#startup";
import "#updater";

import { createTray } from "#tray";
import { startAllVaults, stopAllVaults } from "#vault/manage";
import { createWindow } from "#window";

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
