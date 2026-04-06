import { ZConfig, ZConfigType } from "@blinkdisk/schemas/config";
import { ZVault, ZVaultType } from "@blinkdisk/schemas/vault";
import { setupSignalDBMain } from "@blinkdisk/signaldb-electron/main";
import { SchemaCollection } from "@electron/db/schema";
import { globalAccountDirectory } from "@electron/path";
import { AccountStorageType, store } from "@electron/store";
import createFilesystemAdapter from "@signaldb/fs";
import { ipcMain } from "electron";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const bridge = setupSignalDBMain(ipcMain);

export function setupDB() {
  if (!existsSync(globalAccountDirectory()))
    mkdirSync(globalAccountDirectory(), { recursive: true });

  initAccountDB("local");

  const accounts = store.get("accounts") as Record<string, AccountStorageType>;

  for (const [accountId, account] of Object.entries(accounts)) {
    if (!account.active) continue;
    initAccountDB(accountId);
  }
}

export function initAccountDB(accountId: string) {
  const directory = join(globalAccountDirectory(), accountId);
  if (!existsSync(directory)) mkdirSync(directory, { recursive: true });

  const vault = new SchemaCollection({
    persistence: createFilesystemAdapter<ZVaultType, string>(
      join(directory, "vault.json"),
    ),
    schema: ZVault,
  });

  const config = new SchemaCollection({
    persistence: createFilesystemAdapter<ZConfigType, string>(
      join(directory, "config.json"),
    ),
    schema: ZConfig,
  });

  bridge.addCollection(vault, { name: `${accountId}/vault` });
  bridge.addCollection(config, { name: `${accountId}/config` });
}
