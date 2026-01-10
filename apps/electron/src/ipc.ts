import { setConfigCache, setVaultCache } from "@electron/cache";
import { decryptVaultConfig, encryptVaultConfig } from "@electron/encryption";
import { folderSize, isDirectory } from "@electron/fs";
import { getPasswordCache, setPasswordCache } from "@electron/password";
import { getHostName, getUserName } from "@electron/profile";
import {
  checkEmpty,
  listRestores,
  restoreDirectory,
  restoreMultiple,
  restoreSingle,
} from "@electron/restore";
import { openBrowser } from "@electron/shell";
import { sshKeyscan } from "@electron/ssh";
import { store } from "@electron/store";
import { getUpdateStatus, installUpdate } from "@electron/updater";
import { getVault, Vault } from "@electron/vault";
import { window } from "@electron/window";
import { app, dialog, ipcMain, shell } from "electron";
import { platform } from "node:os";
import { basename, dirname, join } from "node:path";

ipcMain.on("window.console", () => window?.webContents.toggleDevTools());
ipcMain.on("window.reload", () => window?.reload());
ipcMain.on("store.get", (e, key) => (e.returnValue = store.get(key)));
ipcMain.on("os.hostName", (e) => (e.returnValue = getHostName()));
ipcMain.on("os.userName", (e) => (e.returnValue = getUserName()));
ipcMain.on("os.platform", (e) => (e.returnValue = platform()));

ipcMain.handle("store.set", (_, key, value) => store.set(key, value));
ipcMain.handle("store.clear", (_) => store.clear());
ipcMain.handle("path.basename", (_, path) => basename(path));
ipcMain.handle("path.dirname", (_, path) => dirname(path));
ipcMain.handle("dialog.open", (_, options) => dialog.showOpenDialog(options));
ipcMain.handle("dialog.save", (_, { defaultFileName, ...options }) =>
  dialog.showSaveDialog({
    ...options,
    ...(defaultFileName
      ? { defaultPath: join(app.getPath("downloads"), defaultFileName) }
      : {}),
  }),
);
ipcMain.handle("vault.cache", (_, payload) => setVaultCache(payload));
ipcMain.handle("vault.validate", (_, config) => Vault.validate(config));
ipcMain.handle("vault.create", (_, config) => Vault.create(config));
ipcMain.handle("vault.status", (_, payload) => getVault(payload)?.status);
ipcMain.handle("vault.restore.single", (_, payload) => restoreSingle(payload));
ipcMain.handle("vault.restore.multiple", (_, payload) =>
  restoreMultiple(payload),
);
ipcMain.handle("vault.restore.directory", (_, payload) =>
  restoreDirectory(payload),
);
ipcMain.handle("vault.restore.list", (_, payload) => listRestores(payload));
ipcMain.handle("vault.restore.checkEmpty", (_, payload) => checkEmpty(payload));
ipcMain.handle("vault.config.encrypt", (_, payload) =>
  encryptVaultConfig(payload),
);
ipcMain.handle("vault.config.decrypt", (_, payload) =>
  decryptVaultConfig(payload),
);
ipcMain.handle("vault.password.set", (_, payload) => setPasswordCache(payload));
ipcMain.handle("vault.password.get", (_, payload) => getPasswordCache(payload));
ipcMain.handle("config.cache", (_, payload) => setConfigCache(payload));
ipcMain.handle("shell.open.file", (_, url) => shell.showItemInFolder(url));
ipcMain.handle("shell.open.folder", (_, url) => shell.openPath(url));
ipcMain.handle("shell.open.browser", (_, url) => openBrowser(url));
ipcMain.handle("fs.folderSize", (_, path) => folderSize(path));
ipcMain.handle("fs.isDirectory", (_, path) => isDirectory(path));
ipcMain.handle("ssh.keyscan", (_, form) => sshKeyscan(form));
ipcMain.handle("update.status", (_) => getUpdateStatus());
ipcMain.handle("update.install", (_) => installUpdate());
