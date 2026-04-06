import { ZConfig, ZConfigType } from "@blinkdisk/schemas/config";
import { ZVault, ZVaultType } from "@blinkdisk/schemas/vault";
import { setupSignalDBMain } from "@blinkdisk/signaldb-electron/main";
import { getAccountCache } from "@electron/cache";
import { SchemaCollection } from "@electron/db/schema";
import { globalAccountDirectory } from "@electron/path";
import createFilesystemAdapter from "@signaldb/fs";
import { ipcMain } from "electron";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const bridge = setupSignalDBMain(ipcMain);

export function setupCollections() {
  if (!existsSync(globalAccountDirectory()))
    mkdirSync(globalAccountDirectory(), { recursive: true });

  initAccountCollections("local");

  const accounts = getAccountCache();

  for (const account of accounts) {
    if (!account.active) continue;
    initAccountCollections(account.id);
  }
}

function createVaultCollection(directory: string) {
  return new SchemaCollection({
    persistence: createFilesystemAdapter<ZVaultType, string>(
      join(directory, "vault.json"),
    ),
    schema: ZVault,
  });
}

export type VaultCollection = ReturnType<typeof createVaultCollection>;

function createConfigCollection(directory: string) {
  return new SchemaCollection({
    persistence: createFilesystemAdapter<ZConfigType, string>(
      join(directory, "config.json"),
    ),
    schema: ZConfig,
  });
}

export type ConfigCollection = ReturnType<typeof createConfigCollection>;

export const collections: Record<
  string,
  {
    vault: VaultCollection;
    config: ConfigCollection;
  }
> = {};

export function initAccountCollections(accountId: string) {
  const directory = join(globalAccountDirectory(), accountId);
  if (!existsSync(directory)) mkdirSync(directory, { recursive: true });

  const vault = createVaultCollection(directory);
  const config = createConfigCollection(directory);

  bridge.addCollection(vault, { name: `${accountId}/vault` });
  bridge.addCollection(config, { name: `${accountId}/config` });

  collections[accountId] = { vault, config };
}
