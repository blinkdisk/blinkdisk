import { platform } from "@electron/path";
import { focusWindow } from "@electron/window";
import { Menu, Tray, app, nativeImage } from "electron";
import { join } from "path";

let tray: Tray | null = null;

export function createTray() {
  const iconsPath = !app.isPackaged
    ? join("assets", "tray")
    : join(process.resourcesPath, "assets", "tray");

  const fileName =
    platform === "mac"
      ? "mac-Template.png"
      : platform === "win"
        ? "win.ico"
        : "linux.png";

  const trayIcon = nativeImage.createFromPath(join(iconsPath, fileName));

  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    { label: "Open", type: "normal", click: () => focusWindow() },
    { label: "Quit", type: "normal", click: () => app.quit() },
  ]);

  tray.setToolTip("BlinkDisk");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => focusWindow());
  tray.on("double-click", () => focusWindow());
  tray.on("right-click", () => tray?.popUpContextMenu());
}
