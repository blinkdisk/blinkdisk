import { ProviderType } from "@config/providers";
import { trpc } from "@desktop/lib/trpc";
import { ProviderConfig } from "@schemas/providers";
import { useCallback } from "react";

export type VaultAction = "CREATE" | "CONNECT" | "UPDATE";

export function useConfigValidation(
  providerType: ProviderType,
  action: VaultAction,
  coreId?: string,
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

      const storedId = atob(result.uniqueID || "");

      if (action === "CONNECT" && storedId !== coreId)
        return {
          code: "INCORRECT_VAULT_FOUND",
        };

      if (action === "CREATE") {
        const vaults = await trpc.vault.list.query();

        const existing = vaults.find((v) => v.coreId === storedId);
        if (existing)
          return {
            code: "VAULT_ALREADY_EXISTS",
            name: existing.name,
          };

        return undefined;
      }
    },
    [action, coreId, providerType],
  );

  return { onSubmitAsync };
}
