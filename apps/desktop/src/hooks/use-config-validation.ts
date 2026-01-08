import { ProviderType } from "@config/providers";
import { ProviderConfig } from "@schemas/providers";
import { useCallback } from "react";

export type VaultAction = "CREATE" | "CONNECT" | "UPDATE";

export function useConfigValidation(
  providerType: ProviderType,
  action: VaultAction,
  storageId?: string,
) {
  const onSubmitAsync = useCallback(
    async ({ value }: { value: object }) => {
      if (action === "UPDATE") return { code: "READ_ONLY" };

      const result = await window.electron.vault.validate({
        type: providerType,
        config: value as ProviderConfig,
      });

      // Repository is not initialized yet, success.
      if (result.code === "NOT_INITIALIZED") {
        if (action === "CREATE") return;
        if (action === "CONNECT")
          return {
            code: "STORAGE_NOT_FOUND",
          };
      }

      if (result.error)
        return {
          code: "STORAGE_VALIDATION_FAILED",
          message: result.code
            ? `[${result.code}] ${result.error}`
            : result.error,
        };

      if (action === "CREATE")
        return {
          code: "STORAGE_ALREADY_EXISTS",
        };

      if (
        action === "CONNECT" &&
        storageId &&
        result.uniqueID &&
        atob(result.uniqueID) !== storageId
      )
        return {
          code: "INCORRECT_STORAGE_FOUND",
        };
    },
    [action, storageId, providerType],
  );

  return { onSubmitAsync };
}
