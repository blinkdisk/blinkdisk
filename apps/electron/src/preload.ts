import type { setConfigCache, setVaultCache } from "@electron/cache";
import type {
  decryptVaultConfig,
  encryptVaultConfig,
} from "@electron/encryption";
import type { getPasswordCache, setPasswordCache } from "@electron/password";
import {
  checkEmpty,
  listRestores,
  restoreDirectory,
  restoreMultiple,
  restoreSingle,
} from "@electron/restore";
import type { sshKeyscan } from "@electron/ssh";
import type {
  AccountStorageSchema,
  GlobalStorageSchema,
} from "@electron/store";
import type { UpdateStatus } from "@electron/updater";
import type { getVault, Vault } from "@electron/vault";
import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  OpenDialogOptions,
  OpenDialogReturnValue,
  SaveDialogOptions,
  SaveDialogReturnValue,
  webFrame,
  webUtils,
} from "electron";

ipcRenderer.setMaxListeners(240);

function listener<Payload>(event: string) {
  return (callback: (payload: Payload) => void) => {
    function handler(_: IpcRendererEvent, payload: Payload) {
      callback(payload);
    }

    ipcRenderer.on(event, handler);

    return () => {
      ipcRenderer.off(event, handler);
    };
  };
}

const api = {
  window: {
    reload: () => ipcRenderer.send("window.reload"),
    console: () => ipcRenderer.send("window.console"),
  },
  store: {
    get: (
      key?:
        | keyof GlobalStorageSchema
        | `accounts.${string}.${keyof AccountStorageSchema}`,
    ) => ipcRenderer.sendSync("store.get", key) as unknown,
    set: setStorage,
    change: listener<void>("store.change"),
    clear: () => ipcRenderer.invoke("store.clear") as Promise<void>,
  },
  space: {
    update: listener<{
      vaultId: string;
      space: {
        used: number;
        capacity: number;
      };
    }>("space.update"),
  },
  zoom: (level: number) => webFrame.setZoomFactor(level),
  os: {
    hostName: () => ipcRenderer.sendSync("os.hostName") as string,
    userName: () => ipcRenderer.sendSync("os.userName") as string,
    platform: () => ipcRenderer.sendSync("os.platform") as string,
  },
  path: {
    basename: (path: string) =>
      ipcRenderer.invoke("path.basename", path) as Promise<string>,
    dirname: (path: string) =>
      ipcRenderer.invoke("path.dirname", path) as Promise<string>,
  },
  dialog: {
    open: (options: OpenDialogOptions) =>
      ipcRenderer.invoke(
        "dialog.open",
        options,
      ) as Promise<OpenDialogReturnValue>,
    save: (options: SaveDialogOptions & { defaultFileName?: string }) =>
      ipcRenderer.invoke(
        "dialog.save",
        options,
      ) as Promise<SaveDialogReturnValue>,
  },
  config: {
    cache: (payload: Parameters<typeof setConfigCache>[0]) =>
      ipcRenderer.invoke("config.cache", payload),
  },
  fs: {
    folderSize: (path: string) =>
      ipcRenderer.invoke("fs.folderSize", path) as Promise<number>,
    isDirectory: (path: string) =>
      ipcRenderer.invoke("fs.isDirectory", path) as Promise<boolean>,
    getPathFromFile: (file: File) => webUtils.getPathForFile(file),
  },
  vault: {
    validate: (payload: Parameters<typeof Vault.validate>[0]) =>
      ipcRenderer.invoke("vault.validate", payload) as Promise<
        ReturnType<typeof Vault.validate>
      >,
    create: (payload: Parameters<typeof Vault.create>[0]) =>
      ipcRenderer.invoke("vault.create", payload) as ReturnType<
        typeof Vault.create
      >,
    cache: (payload: Parameters<typeof setVaultCache>[0]) =>
      ipcRenderer.invoke("vault.cache", payload) as Promise<
        ReturnType<typeof setVaultCache>
      >,
    status: (payload: Parameters<typeof getVault>[0]) =>
      ipcRenderer.invoke("vault.status", payload) as Promise<
        InstanceType<typeof Vault>["status"]
      >,
    config: {
      encrypt: (payload: Parameters<typeof encryptVaultConfig>[0]) =>
        ipcRenderer.invoke("vault.config.encrypt", payload),
      decrypt: (payload: Parameters<typeof decryptVaultConfig>[0]) =>
        ipcRenderer.invoke("vault.config.decrypt", payload),
    },
    password: {
      set: (payload: Parameters<typeof setPasswordCache>[0]) =>
        ipcRenderer.invoke("vault.password.set", payload) as Promise<
          ReturnType<typeof setPasswordCache>
        >,
      get: (payload: Parameters<typeof getPasswordCache>[0]) =>
        ipcRenderer.invoke("vault.password.get", payload) as Promise<
          ReturnType<typeof getPasswordCache>
        >,
    },
    restore: {
      single: (payload: Parameters<typeof restoreSingle>[0]) =>
        ipcRenderer.invoke("vault.restore.single", payload) as Promise<
          ReturnType<typeof restoreSingle>
        >,
      multiple: (payload: Parameters<typeof restoreMultiple>[0]) =>
        ipcRenderer.invoke("vault.restore.multiple", payload) as Promise<
          ReturnType<typeof restoreMultiple>
        >,
      directory: (payload: Parameters<typeof restoreDirectory>[0]) =>
        ipcRenderer.invoke("vault.restore.directory", payload) as Promise<
          ReturnType<typeof restoreDirectory>
        >,
      list: (payload: Parameters<typeof listRestores>[0]) =>
        ipcRenderer.invoke("vault.restore.list", payload) as Promise<
          ReturnType<typeof listRestores>
        >,
      checkEmpty: (payload: Parameters<typeof checkEmpty>[0]) =>
        ipcRenderer.invoke("vault.restore.checkEmpty", payload) as Promise<
          ReturnType<typeof checkEmpty>
        >,
    },
  },
  shell: {
    open: {
      file: (path: string) => ipcRenderer.invoke("shell.open.file", path),
      folder: (path: string) => ipcRenderer.invoke("shell.open.folder", path),
      browser: (url: string) => ipcRenderer.invoke("shell.open.browser", url),
    },
  },
  deeplink: {
    open: listener<{ event: string }>("deeplink.open"),
  },
  ssh: {
    keyscan: (form: Parameters<typeof sshKeyscan>[0]) =>
      ipcRenderer.invoke("ssh.keyscan", form) as ReturnType<typeof sshKeyscan>,
  },
  update: {
    change: listener<UpdateStatus>("update.available"),
    status: () => ipcRenderer.invoke("update.status") as Promise<UpdateStatus>,
    install: () => ipcRenderer.invoke("update.install") as Promise<void>,
  },
};

function setStorage<
  K extends
    | keyof GlobalStorageSchema
    | `accounts.${string}.${keyof AccountStorageSchema}`,
>(key: K, value: unknown): Promise<void> {
  return ipcRenderer.invoke("store.set", key, value);
}

contextBridge.exposeInMainWorld("electron", api);

export type ElectronAPI = typeof api;
