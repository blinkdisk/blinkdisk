import { ProviderType } from "@config/providers";
import { LATEST_VAULT_VERSION } from "@config/vault";
import { getAccountCache, getVaultCache } from "@electron/cache";
import { log } from "@electron/log";
import { getHostName, getUserName } from "@electron/profile";
import { fetchVault } from "@electron/vault/fetch";
import { mapConfigFields, mapProviderType } from "@electron/vault/mapping";
import { startVaultServer } from "@electron/vault/server";
import { ProviderConfig } from "@schemas/providers";
import { ZVaultOptionsType } from "@schemas/shared/vault";
import { VaultInstance } from "./types";
import { validationVault } from "./validate";

export const vaults: Record<string, VaultInstance> = {};

export async function createVault(payload: {
  vault: {
    id: string;
    name: string;
    provider: ProviderType;
    config: ProviderConfig;
    options: ZVaultOptionsType;
    password: string;
    token?: string | null;
  };
  userPolicy: object;
  globalPolicy: object;
}) {
  const options = payload.vault.options;

  let vault: VaultInstance;
  if (vaults[payload.vault.id]) vault = vaults[payload.vault.id]!;
  else
    vault = {
      id: payload.vault.id,
      status: "STARTING",
      server: await startVaultServer(payload.vault.id),
    };

  try {
    const response = await fetchVault(vault, {
      method: "POST",
      path: "/api/v1/repo/create",
      data: {
        globalPolicy: payload.globalPolicy,
        userPolicy: payload.userPolicy,
        clientOptions: {
          description: payload.vault.name,
          username: getUserName(payload.vault.id),
          hostname: getHostName(payload.vault.id),
        },
        options: {
          uniqueId: btoa(payload.vault.id),
          blockFormat: {
            version: options.version,
            ecc: options.errorCorrectionAlgorithm,
            eccOverheadPercent: options.errorCorrectionOverhead,
            encryption: options.encryption,
            hash: options.hash,
          },
          objectFormat: {
            splitter: options.splitter,
          },
        },
        storage: {
          type: mapProviderType(payload.vault.provider),
          config: mapConfigFields(
            payload.vault.provider,
            payload.vault.config,
            LATEST_VAULT_VERSION,
            payload.vault.token,
          ),
        },
        password: payload.vault.password,
      },
    });

    return response as { error?: string };
  } catch (e) {
    log.error("Failed to create vault, stopping:", e);
    stopVault(vault.id);
    return e as { code?: string; error?: string };
  }
}

export async function connectVault({
  id,
  name,
  config,
  password,
  provider,
  token,
  version,
}: {
  id: string;
  name: string;
  provider: ProviderType;
  config: ProviderConfig;
  password: string;
  version?: number;
  token?: string | null;
}) {
  let vault: VaultInstance;
  if (vaults[id]) vault = vaults[id]!;
  else
    vault = {
      id,
      status: "STARTING",
      server: await startVaultServer(id),
    };

  try {
    const response = await fetchVault(vault, {
      method: "POST",
      path: "/api/v1/repo/connect",
      data: {
        clientOptions: {
          description: name,
          username: getUserName(id),
          hostname: getHostName(id),
        },
        storage: {
          type: mapProviderType(provider),
          config: mapConfigFields(provider, config, version, token),
        },
        password,
      },
    });

    return response as { error?: string; code?: string };
  } catch (e) {
    return e as { code?: string; error?: string };
  }
}

export async function startAllVaults() {
  const vaultCache = getVaultCache();
  const accounts = getAccountCache();

  for (const vault of vaultCache) {
    const account = accounts.find((account) => account.id === vault.accountId);

    if (!account) {
      log.error(`Account ${vault.accountId} not found, skipping.`);
      continue;
    }

    if (!account.active) {
      log.info(`Account ${vault.accountId} is not active, skipping.`);
      continue;
    }

    // Already running
    if (vaults[vault.id]) continue;

    vaults[vault.id] = {
      id: vault.id,
      status: "STARTING",
      server: await startVaultServer(vault.id),
    };
  }
}

export function stopAllVaults() {
  Object.keys(vaults).forEach(stopVault);
  if (validationVault) validationVault.server.process.kill();
}

function stopVault(id: string) {
  const vault = vaults[id];
  if (!vault) return log.warn(`Tried to stop vault ${id} but it doesn't exist`);

  vault.server.process.kill();
  delete vaults[id];
}

export function getVault(id: string) {
  const vault = vaults[id];
  if (!vault) throw new Error(`Get vault called, but ${id} not found`);
  return vault;
}

export function getVaultStatus(id: string) {
  const vault = getVault(id);
  return { status: vault.status, initTask: vault.initTask };
}
