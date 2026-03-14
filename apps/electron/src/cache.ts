import { encryptString } from "@electron/encryption";
import {
  AccountStorageType,
  GlobalStorageSchema,
  store,
} from "@electron/store";
import { startAllVaults } from "./vault/manage";

export type VaultCacheWithId = GlobalStorageSchema["vaults"][string] & {
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
  vaults: (Omit<VaultCacheWithId, "token"> & { token?: string | null })[];
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

  otherVaults.push(
    ...vaults.map((vault) => ({
      ...vault,
      token: vault.token ? encryptString(vault.token) : undefined,
    })),
  );

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

  startAllVaults();
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
}

export function getAccountCache() {
  const accounts = store.get("accounts") || {};

  return Object.entries(accounts).map(([id, account]) => ({
    id,
    ...account,
  })) as AccountCacheWithId[];
}
