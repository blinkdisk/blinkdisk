import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { SchemaCollection } from "@blinkdisk/electron/db/schema";
import { ZConfig, ZConfigType } from "@blinkdisk/schemas/config";
import { ZVault, ZVaultType } from "@blinkdisk/schemas/vault";
import { createElectronAdapter } from "@blinkdisk/signaldb-electron/renderer";
import maverickReactivityAdapter from "@signaldb/maverickjs";

const vaultCollections: Record<
  string,
  ReturnType<typeof createVaultCollection>
> = {};

function createVaultCollection(accountId: string) {
  return new SchemaCollection({
    schema: ZVault,
    persistence: createElectronAdapter<ZVaultType, string>(
      `${accountId}/vault`,
    ),
    reactivity: maverickReactivityAdapter,
  });
}

export function getVaultCollection(accountId: string | undefined) {
  if (!accountId) accountId = LOCAL_ACCOUNT_ID;

  if (!vaultCollections[accountId])
    vaultCollections[accountId] = createVaultCollection(accountId);

  return vaultCollections[accountId] as ReturnType<
    typeof createVaultCollection
  >;
}

const configCollections: Record<
  string,
  ReturnType<typeof createConfigCollection>
> = {};

function createConfigCollection(accountId: string) {
  return new SchemaCollection({
    schema: ZConfig,
    persistence: createElectronAdapter<ZConfigType, string>(
      `${accountId}/config`,
    ),
    reactivity: maverickReactivityAdapter,
  });
}

export function getConfigCollection(accountId: string | undefined) {
  if (!accountId) accountId = LOCAL_ACCOUNT_ID;

  if (!configCollections[accountId])
    configCollections[accountId] = createConfigCollection(accountId);

  return configCollections[accountId] as ReturnType<
    typeof createConfigCollection
  >;
}
