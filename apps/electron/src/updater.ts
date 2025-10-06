import { app } from "electron";
import electronUpdater from "electron-updater";

(async () => {
  if (!app.isPackaged) return;

  const { autoUpdater } = electronUpdater;

  function check() {
    autoUpdater.checkForUpdatesAndNotify();
  }

  setInterval(check, 1000 * 60 * 60 * 24);
  check();
})();
