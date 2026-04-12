// App should be imported before sentry
import { app } from "electron";
// But sentry should be imported directly after
import { listenProtocol, registerProtcol } from "@electron/protocol";
import * as Sentry from "@sentry/electron/main";

Sentry.init({
  dsn: process.env.SENTRY_DESKTOP_DSN,
  enabled: process.env.NODE_ENV !== "development",
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

import { setupCollections } from "@electron/db";
import { checkDeepLink } from "@electron/deeplink";
import { initEncryption } from "@electron/encryption";
import { runMigrations } from "@electron/migrate";
import { createTray } from "@electron/tray";
import { initVaults, stopAllVaults } from "@electron/vault/manage";
import { createWindow } from "@electron/window";

app.on("ready", async () => {
  initEncryption();
  await runMigrations();
  await setupCollections();

  listenProtocol();
  createTray();
  initVaults();

  if (!process.argv.includes("--hidden")) createWindow();

  // Deeplinks might send messages to the window
  // so it should be called after createWindow
  checkDeepLink();
});

app.on("will-quit", function () {
  stopAllVaults();
});

// Prevents the app from quitting when all windows are closed
app.on("window-all-closed", () => null);
