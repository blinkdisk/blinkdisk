import { StorageProviderType } from "@blinkdisk/constants/providers";
import { ProviderConfig } from "@blinkdisk/schemas/providers";
import { trpc } from "@desktop/lib/trpc";
import { useCallback } from "react";

export type VaultAction = "CREATE" | "SETUP" | "UPDATE";

export function useConfigValidation(
  providerType: StorageProviderType,
  action: VaultAction,
) {
  const onSubmitAsync = useCallback(
    async ({ value }: { value: object }) => {
      // Validation for connect is done elsewhere
      if (action === "SETUP") return;

      // Can't update config at the moment
      if (action === "UPDATE") return { code: "READ_ONLY" };

      const result = await window.electron.vault.validate({
        type: providerType,
        config: value as ProviderConfig,
      });

      if (result.code === "NOT_INITIALIZED") return;

      if (result.error)
        return {
          code: "VAULT_VALIDATION_FAILED",
          message: result.code
            ? `[${result.code}] ${result.error}`
            : result.error,
        };

      const storedId = atob(result.uniqueID || "");

      const vaults = await trpc.vault.list.query();

      const existing = vaults.find((v) => v.coreId === storedId);
      if (existing)
        return {
          code: "VAULT_ALREADY_EXISTS",
          name: existing.name,
        };
    },
    [action, providerType],
  );

  return { onSubmitAsync };
}
