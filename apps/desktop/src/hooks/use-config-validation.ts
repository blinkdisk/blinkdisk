import { ProviderType } from "@config/providers";
import { ProviderConfig } from "@schemas/providers";
import { useCallback } from "react";

export type VaultAction = "CREATE" | "CONNECT" | "UPDATE";

export function useConfigValidation(
  providerType: ProviderType,
  action: VaultAction,
  vaultId?: string,
) {
  const onSubmitAsync = useCallback(
    async ({ value }: { value: object }) => {
      if (action === "UPDATE") return { code: "READ_ONLY" };

      const result = await window.electron.vault.validate({
        type: providerType,
        config: value as ProviderConfig,
      });

      if (result.code === "NOT_INITIALIZED") {
        if (action === "CREATE") return;
        if (action === "CONNECT")
          return {
            code: "VAULT_NOT_FOUND",
          };
      }

      if (result.error)
        return {
          code: "VAULT_VALIDATION_FAILED",
          message: result.code
            ? `[${result.code}] ${result.error}`
            : result.error,
        };

      if (action === "CREATE")
        return {
          code: "VAULT_ALREADY_EXISTS",
        };

      if (
        action === "CONNECT" &&
        vaultId &&
        result.uniqueID &&
        atob(result.uniqueID) !== vaultId
      ) {
        const storedId = atob(result.uniqueID);

        // Update legacy ids with "strg" prefix
        if (storedId.startsWith("strg_")) storedId.replace(/^strg_/, "vlt_");

        if (storedId !== vaultId)
          return {
            code: "INCORRECT_VAULT_FOUND",
          };
      }
    },
    [action, vaultId, providerType],
  );

  return { onSubmitAsync };
}
