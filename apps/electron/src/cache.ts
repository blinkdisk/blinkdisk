import { encryptString } from "@electron/encryption";
import {
  AccountStorageType,
  GlobalStorageSchema,
  store,
} from "@electron/store";
import { Vault } from "@electron/vault";

export type StorageCacheWithId = GlobalStorageSchema["storages"][string] & {
  id: string;
};

export type VaultCacheWithId = GlobalStorageSchema["vaults"][string] & {
  id: string;
};

export type ConfigCacheWithId = GlobalStorageSchema["configs"][string] & {
  id: string;
};

export type AccountCacheWithId = AccountStorageType & {
  id: string;
};

export function setVaultCache({
  accountId,
  vaults,
}: {
  accountId: string;
  vaults: VaultCacheWithId[];
}) {
  const cachedVaults = store.get("vaults") || {};
  const otherVaults = Object.entries(cachedVaults)
    .map(
      ([id, vault]) =>
        ({
          id,
          ...vault,
        }) as GlobalStorageSchema["vaults"][string] & {
          id: string;
        },
    )
    .filter((vault) => vault.accountId !== accountId);

  otherVaults.push(...vaults);

  store.set(
    "vaults",
    otherVaults.reduce(
      (acc, vault) => {
        const { id, ...rest } = vault;
        acc[id] = rest;
        return acc;
      },
      {} as GlobalStorageSchema["vaults"],
    ),
  );

  Vault.onCacheChanged();
}

export function getVaultCache() {
  const vaults = store.get("vaults") || {};

  return Object.entries(vaults).map(([id, vault]) => ({
    id,
    ...vault,
  })) as VaultCacheWithId[];
}

export function deleteVaultFromCache(id: string) {
  const vaults = store.get("vaults") || {};

  store.set("vaults", {
    ...vaults,
    [id]: undefined,
  });

  Vault.onCacheChanged();
}

export function getAccountCache() {
  const accounts = store.get("accounts") || {};

  return Object.entries(accounts).map(([id, account]) => ({
    id,
    ...account,
  })) as AccountCacheWithId[];
}

export function setStorageCache({
  accountId,
  storages,
}: {
  accountId: string;
  storages: (Omit<StorageCacheWithId, "token"> & { token?: string | null })[];
}) {
  const cachedStorages = store.get("storages") || {};
  const otherStorages = Object.entries(cachedStorages)
    .map(
      ([id, storage]) =>
        ({
          id,
          ...storage,
        }) as GlobalStorageSchema["storages"][string] & {
          id: string;
        },
    )
    .filter((storage) => storage.accountId !== accountId);

  otherStorages.push(
    ...storages.map((storage) => ({
      ...storage,
      token: storage.token ? encryptString(storage.token) : undefined,
    })),
  );

  store.set(
    "storages",
    otherStorages.reduce(
      (acc, storage) => {
        const { id, ...rest } = storage;
        acc[id] = rest;
        return acc;
      },
      {} as GlobalStorageSchema["storages"],
    ),
  );

  Vault.onCacheChanged();
}

export function getStorageCache() {
  const storages = store.get("storages") || {};

  return Object.entries(storages).map(([id, storage]) => ({
    id,
    ...storage,
  })) as StorageCacheWithId[];
}

export function setConfigCache({
  accountId,
  configs,
}: {
  accountId: string;
  configs: ConfigCacheWithId[];
}) {
  const cachedConfigs = store.get("configs") || {};
  const otherConfigs = Object.entries(cachedConfigs)
    .map(
      ([id, config]) =>
        ({
          id,
          ...config,
        }) as GlobalStorageSchema["configs"][string] & {
          id: string;
        },
    )
    .filter((config) => config.accountId !== accountId);

  otherConfigs.push(...configs);

  store.set(
    "configs",
    otherConfigs.reduce(
      (acc, config) => {
        const { id, ...rest } = config;
        acc[id] = rest;
        return acc;
      },
      {} as GlobalStorageSchema["configs"],
    ),
  );

  Vault.onCacheChanged();
}

export function getConfigCache() {
  const configs = store.get("configs") || {};

  return Object.entries(configs).map(([id, config]) => ({
    id,
    ...config,
  })) as ConfigCacheWithId[];
}
