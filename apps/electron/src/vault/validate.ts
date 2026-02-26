import { ProviderType } from "@config/providers";
import { LATEST_VAULT_VERSION } from "@config/vault";
import { fetchVault } from "@electron/vault/fetch";
import { mapConfigFields, mapProviderType } from "@electron/vault/mapping";
import { startVaultServer } from "@electron/vault/server";
import { VaultInstance } from "@electron/vault/types";
import { ProviderConfig } from "@schemas/providers";

export let validationVault: VaultInstance | null = null;

export async function validateVaultConfig(vault: {
  type: ProviderType;
  config: ProviderConfig;
  password?: string;
}) {
  if (!validationVault) {
    const id = "temporary";

    validationVault = {
      id,
      status: "RUNNING",
      server: await startVaultServer(id, false),
    };
  }

  return (await fetchVault(validationVault, {
    method: "POST",
    path: "/api/v1/repo/exists",
    data: {
      storage: {
        type: mapProviderType(vault.type),
        config: mapConfigFields(vault.type, vault.config, LATEST_VAULT_VERSION),
      },
      ...(vault.password && { password: vault.password }),
    },
  })) as { code?: string; error?: string; uniqueID?: string };
}
