import { openBrowser } from "@electron/shell";
import { store } from "@electron/store";
import { BrowserWindow, app } from "electron";

import { join } from "path";

export let window: BrowserWindow | null = null;

export function createWindow() {
  const theme = store.get("preferences.theme");

  window = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 950,
    minHeight: 500,
    title: "BlinkDisk",
    backgroundColor: theme == "light" ? "#ffffff" : "#222222",
    webPreferences: {
      preload: join(import.meta.dirname, "preload.js"),
    },
  });

  if (!app.isPackaged) window.webContents.openDevTools();

  window.setMenu(null);
  window.loadURL(
    app.isPackaged ? "blinkdiskapp://frontend" : "http://localhost:5173",
  );

  window.webContents.setWindowOpenHandler(({ url: rawUrl }) => {
    const url = new URL(rawUrl);

    console.log(rawUrl);
    if (
      url.protocol === "blinkdiskapp:" ||
      (url.hostname === "localhost" && url.port === "5173")
    )
      window?.loadURL(rawUrl);
    else if (
      url.protocol === "https:" ||
      url.protocol === "http:" ||
      url.protocol === "mailto:"
    )
      openBrowser(rawUrl);

    return { action: "deny" };
  });

  return window;
}

export function focusWindow() {
  if (!window || window.isDestroyed()) window = createWindow();
  if (!window.isVisible()) window.show();
  if (window.isMinimized()) window.restore();
  window.focus();
}
export function sendWindow(channel: string, payload?: object) {
  if (!window || window.isDestroyed()) return;
  window.webContents.send(channel, payload);
}
