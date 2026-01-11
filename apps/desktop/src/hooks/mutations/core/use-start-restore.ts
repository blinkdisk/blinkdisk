import { DirectoryItem } from "@desktop/hooks/queries/core/use-directory";
import { useFolderId } from "@desktop/hooks/use-folder-id";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZRestoreDirectoryType } from "@schemas/directory";
import { CustomError } from "@utils/error";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useStartRestore(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const { t } = useAppTranslation("directory.table.restore");

  const { vaultId } = useVaultId();
  const { folderId } = useFolderId();
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
      if (!vaultId || !folderId) throw new CustomError("MISSING_REQUIRED_VALUE");

      if (options.variant === "single")
        return await window.electron.vault.restore.single({
          vaultId,
          folderId,
          item: options.item,
          dialogTitle: t("single.dialog.title"),
        });

      if (options.variant === "multiple")
        return await window.electron.vault.restore.multiple({
          vaultId,
          folderId,
          items: options.items,
          dialogTitle: t("multiple.dialog.title"),
        });

      if (options.variant === "directory")
        return await window.electron.vault.restore.directory({
          vaultId,
          folderId,
          options: options.values,
          objectId: options.objectId,
        });
    },
    onError: showErrorToast,
    onSuccess: async (res) => {
      if (res !== true) return;

      await queryClient.invalidateQueries({
        queryKey: queryKeys.folder.restores(folderId),
      });

      options?.onSuccess?.();
    },
  });
}
