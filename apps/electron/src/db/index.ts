import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { ZConfig, type ZConfigType } from "@blinkdisk/schemas/config";
import { ZVault, type ZVaultType } from "@blinkdisk/schemas/vault";
import { setupSignalDBMain } from "@blinkdisk/signaldb-electron/main";
import { getAccountCache } from "@electron/cache";
import { SchemaCollection } from "@electron/db/schema";
import { getLastSync, syncManager } from "@electron/db/sync";
import { log } from "@electron/log";
import { globalAccountDirectory } from "@electron/path";
import { initVaults } from "@electron/vault/manage";
import createFilesystemAdapter from "@signaldb/fs";
import { ipcMain } from "electron";

const bridge = setupSignalDBMain(ipcMain);

export async function setupCollections() {
  if (!existsSync(globalAccountDirectory()))
    mkdirSync(globalAccountDirectory(), { recursive: true });

  await initAccountCollections("local");

  const accounts = getAccountCache();

  for (const account of accounts) {
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

const accountInitializations = new Map<string, Promise<void>>();
const accountsPendingSync = new Set<string>();

export function initAccountCollections(accountId: string) {
  const existing = accountInitializations.get(accountId);
  if (existing) return existing;

  const initialization = initializeAccountCollections(accountId).catch(
    (error) => {
      accountInitializations.delete(accountId);
      throw error;
    },
  );
  accountInitializations.set(accountId, initialization);
  return initialization;
}

async function initializeAccountCollections(accountId: string) {
  const vaultName = `${accountId}/vault`;
  const configName = `${accountId}/config`;

  if (!collections[accountId]) await registerAccountCollections(accountId);

  if (accountsPendingSync.has(accountId)) {
    log.info(accountId, "not synced yet, syncing...");

    const results = await Promise.allSettled([
      syncManager.sync(vaultName),
      syncManager.sync(configName),
    ]);
    const failure = results.find((result) => result.status === "rejected");
    if (failure?.status === "rejected") throw failure.reason;

    accountsPendingSync.delete(accountId);
  }

  await initVaults();
}

async function registerAccountCollections(accountId: string) {
  const directory = join(globalAccountDirectory(), accountId);
  if (!existsSync(directory)) mkdirSync(directory, { recursive: true });

  const vault = await createVaultCollection(directory);
  const config = await createConfigCollection(directory);

  collections[accountId] = { vault, config };

  const vaultName = `${accountId}/vault`;
  const configName = `${accountId}/config`;

  bridge.addCollection(vault, { name: vaultName });
  bridge.addCollection(config, { name: configName });

  function onChange() {
    initVaults();
  }

  vault.on("added", onChange);
  vault.on("updateOne", onChange);
  vault.on("updateMany", onChange);
  vault.on("removed", onChange);

  if (accountId !== LOCAL_ACCOUNT_ID) {
    if (!getLastSync(vaultName)) accountsPendingSync.add(accountId);

    syncManager.addCollection(vault, {
      name: vaultName,
      type: "VAULT",
      accountId,
    });

    syncManager.addCollection(config, {
      name: configName,
      type: "CONFIG",
      accountId,
    });
  }
}
