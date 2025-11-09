import type {
  setConfigCache,
  setStorageCache,
  setVaultCache,
} from "@electron/cache";
import type {
  decryptVaultConfig,
  encryptVaultConfig,
} from "@electron/encryption";
import type {
  comparePassword,
  getPasswordCache,
  hashPassword,
  setPasswordCache,
} from "@electron/password";
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
} from "electron";

ipcRenderer.setMaxListeners(240);

const api = {
  window: {
    reload: () => ipcRenderer.send("window.reload"),
    console: () => ipcRenderer.send("window.console"),
  },
  store: {
    get: (
      key:
        | keyof GlobalStorageSchema
        | `accounts.${string}.${keyof AccountStorageSchema}`,
    ) => ipcRenderer.sendSync("store.get", key) as unknown,
    set: setStorage,
    change: {
      on: (callback: () => void) => ipcRenderer.on("store.change", callback),
      off: (callback: () => void) => ipcRenderer.off("store.change", callback),
    },
    clear: () => ipcRenderer.invoke("store.clear") as Promise<void>,
  },
  space: {
    update: {
      on: (
        callback: (
          e: IpcRendererEvent,
          payload: {
            vaultId: string;
            space: {
              used: number;
              capacity: number;
            };
          },
        ) => void,
      ) => ipcRenderer.on("space.update", callback),
      off: (callback: (...args: any) => void) =>
        ipcRenderer.off("space.update", callback),
    },
  },
  zoom: (level: number) => webFrame.setZoomFactor(level),
  os: {
    machineId: () => ipcRenderer.invoke("os.machineId") as Promise<string>,
    hostName: () => ipcRenderer.invoke("os.hostName") as Promise<string>,
    userName: () => ipcRenderer.invoke("os.userName") as Promise<string>,
    platform: () => ipcRenderer.invoke("os.platform") as Promise<string>,
  },
  path: {
    basename: (path: string) =>
      ipcRenderer.invoke("path.basename", path) as Promise<string>,
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
  storage: {
    cache: (payload: Parameters<typeof setStorageCache>[0]) =>
      ipcRenderer.invoke("storage.cache", payload),
  },
  config: {
    cache: (payload: Parameters<typeof setConfigCache>[0]) =>
      ipcRenderer.invoke("config.cache", payload),
  },
  fs: {
    folderSize: (path: string) =>
      ipcRenderer.invoke("fs.folderSize", path) as Promise<number>,
  },
  vault: {
    validate: (payload: Parameters<typeof Vault.validate>[0]) =>
      ipcRenderer.invoke("vault.validate", payload) as Promise<
        ReturnType<typeof Vault.validate>
      >,
    create: (payload: Parameters<typeof Vault.create>[0]) =>
      ipcRenderer.invoke("vault.create", payload) as Promise<
        ReturnType<typeof Vault.create>
      >,
    cache: (payload: Parameters<typeof setVaultCache>[0]) =>
      ipcRenderer.invoke("vault.cache", payload) as Promise<
        ReturnType<typeof setVaultCache>
      >,
    activate: (payload: Parameters<typeof getVault>[0]) =>
      ipcRenderer.invoke("vault.activate", payload) as Promise<
        ReturnType<InstanceType<typeof Vault>["activate"]>
      >,
    status: (payload: Parameters<typeof getVault>[0]) =>
      ipcRenderer.invoke("vault.status", payload) as Promise<
        InstanceType<typeof Vault>["status"]
      >,
    fetch: (
      payload: Parameters<typeof getVault>[0] &
        Parameters<InstanceType<typeof Vault>["fetch"]>[0],
    ) => ipcRenderer.invoke("vault.fetch", payload) as any,
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
      hash: (payload: Parameters<typeof hashPassword>[0]) =>
        ipcRenderer.invoke("vault.password.hash", payload) as Promise<
          ReturnType<typeof hashPassword>
        >,
      compare: (payload: Parameters<typeof comparePassword>[0]) =>
        ipcRenderer.invoke("vault.password.compare", payload) as Promise<
          ReturnType<typeof comparePassword>
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
    open: {
      on: (
        callback: (e: IpcRendererEvent, payload: { event: string }) => void,
      ) => ipcRenderer.on("deeplink.open", callback),
      off: (callback: (...args: any) => void) =>
        ipcRenderer.off("deeplink.open", callback),
    },
  },
  ssh: {
    keyscan: (form: Parameters<typeof sshKeyscan>[0]) =>
      ipcRenderer.invoke("ssh.keyscan", form) as ReturnType<typeof sshKeyscan>,
  },
};

function setStorage<
  K extends
    | keyof GlobalStorageSchema
    | `accounts.${string}.${keyof AccountStorageSchema}`,
>(key: K, value: any): Promise<void> {
  return ipcRenderer.invoke("store.set", key, value);
}

contextBridge.exposeInMainWorld("electron", api);

export type ElectronAPI = typeof api;
