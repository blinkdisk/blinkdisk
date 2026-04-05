import { setupSignalDBMain } from "@blinkdisk/signaldb-electron/main";
import { globalAccountDirectory } from "@electron/path";
import { AccountStorageType, store } from "@electron/store";
import { Collection } from "@signaldb/core";
import createFilesystemAdapter from "@signaldb/fs";
import { ipcMain } from "electron";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const bridge = setupSignalDBMain(ipcMain);

export function setupDB() {
  if (!existsSync(globalAccountDirectory()))
    mkdirSync(globalAccountDirectory(), { recursive: true });

  const accounts = store.get("accounts") as Record<string, AccountStorageType>;

  for (const [accountId, account] of Object.entries(accounts)) {
    if (!account.active) continue;
    initAccountDB(accountId);
  }
}

export function initAccountDB(accountId: string) {
  const directory = join(globalAccountDirectory(), accountId);
  if (!existsSync(directory)) mkdirSync(directory, { recursive: true });

  const vault = new Collection({
    persistence: createFilesystemAdapter(join(directory, "vault.json")),
  });

  const config = new Collection({
    persistence: createFilesystemAdapter(join(directory, "config.json")),
  });

  bridge.addCollection(vault, { name: `${accountId}/vault` });
  bridge.addCollection(config, { name: `${accountId}/config` });
}
