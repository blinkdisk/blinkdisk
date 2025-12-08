import { DirectoryItem } from "@desktop/hooks/queries/core/use-directory";
import { useFolderId } from "@desktop/hooks/use-folder-id";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { useAppTranslation } from "@hooks/use-app-translation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export function useRestoreMultiple(items: DirectoryItem[] | undefined) {
  const queryClient = useQueryClient();

  const { vaultId } = useVaultId();
  const { folderId } = useFolderId();
  const { queryKeys } = useQueryKey();
  const { t } = useAppTranslation("directory.table.restore.multiple");

  const itemIds = useMemo(() => {
    return items?.map((file) => file.id);
  }, [items]);

  return useMutation({
    mutationKey: ["file", "restore", itemIds],
    mutationFn: async () => {
      if (!vaultId || !folderId || !items?.length) return;

      return await window.electron.vault.restore.multiple({
        vaultId,
        folderId,
        items,
        dialogTitle: t("dialog.title"),
      });
    },
    onError: showErrorToast,
    onSuccess: async (res) => {
      if (res === true)
        await queryClient.invalidateQueries({
          queryKey: queryKeys.folder.restores(folderId),
        });
    },
  });
}
