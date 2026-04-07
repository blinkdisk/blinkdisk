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

export async function setupCollections() {
  if (!existsSync(globalAccountDirectory()))
    mkdirSync(globalAccountDirectory(), { recursive: true });

  await initAccountCollections("local");

  const accounts = getAccountCache();

  for (const account of accounts) {
    if (!account.active) continue;
    await initAccountCollections(account.id);
  }
}

async function createVaultCollection(directory: string) {
  const collection = new SchemaCollection({
    name: "vault",
    persistence: createFilesystemAdapter<ZVaultType, string>(
      join(directory, "vault.json"),
    ),
    schema: ZVault,
  });

  await collection.isReady();
  return collection;
}

export type VaultCollection = Awaited<ReturnType<typeof createVaultCollection>>;

async function createConfigCollection(directory: string) {
  const collection = new SchemaCollection({
    name: "config",
    persistence: createFilesystemAdapter<ZConfigType, string>(
      join(directory, "config.json"),
    ),
    schema: ZConfig,
  });

  await collection.isReady();
  return collection;
}

export type ConfigCollection = Awaited<
  ReturnType<typeof createConfigCollection>
>;

export const collections: Record<
  string,
  {
    vault: VaultCollection;
    config: ConfigCollection;
  }
> = {};

export async function initAccountCollections(accountId: string) {
  if (collections[accountId]) return;

  const directory = join(globalAccountDirectory(), accountId);
  if (!existsSync(directory)) mkdirSync(directory, { recursive: true });

  const vault = await createVaultCollection(directory);
  const config = await createConfigCollection(directory);

  bridge.addCollection(vault, { name: `${accountId}/vault` });
  bridge.addCollection(config, { name: `${accountId}/config` });

  collections[accountId] = { vault, config };
}
