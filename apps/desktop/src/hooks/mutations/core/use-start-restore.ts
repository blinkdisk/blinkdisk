import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import type { ZRestoreDirectoryType } from "@blinkdisk/schemas/directory";
import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import type { DirectoryItem } from "@desktop/hooks/queries/core/use-directory";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useSourceId } from "@desktop/hooks/use-source-id";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useStartRestore(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const { t } = useAppTranslation("directory.table.restore");

  const { vaultId } = useVaultId();
  const { sourceId } = useSourceId();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["file", "restore"],
    mutationFn: async (
      options:
        | { variant: "single"; item: DirectoryItem }
        | { variant: "multiple"; items: DirectoryItem[] }
        | {
            variant: "directory";
            objectId: string;
            values: ZRestoreDirectoryType;
          },
    ) => {
      if (!vaultId || !sourceId)
        throw new CustomError("MISSING_REQUIRED_VALUE");

      if (options.variant === "single")
        return await window.electron.vault.restore.single({
          vaultId,
          sourceId,
          item: options.item,
          dialogTitle: t("single.dialog.title"),
        });

      if (options.variant === "multiple")
        return await window.electron.vault.restore.multiple({
          vaultId,
          sourceId,
          items: options.items,
          dialogTitle: t("multiple.dialog.title"),
        });

      if (options.variant === "directory")
        return await window.electron.vault.restore.directory({
          vaultId,
          sourceId,
          options: options.values,
          objectId: options.objectId,
        });
    },
    onError: showErrorToast,
    onSuccess: async (res) => {
      if (res !== true) return;

      await queryClient.invalidateQueries({
        queryKey: queryKeys.source.restores(sourceId),
      });

      options?.onSuccess?.();
    },
  });
}
