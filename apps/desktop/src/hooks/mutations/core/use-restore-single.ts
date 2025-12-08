import { DirectoryItem } from "@desktop/hooks/queries/core/use-directory";
import { useFolderId } from "@desktop/hooks/use-folder-id";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { useAppTranslation } from "@hooks/use-app-translation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRestoreSingle() {
  const queryClient = useQueryClient();

  const { t } = useAppTranslation("directory.table.restore.single");

  const { vaultId } = useVaultId();
  const { folderId } = useFolderId();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["file", "restore"],
    mutationFn: async (item: DirectoryItem) => {
      if (!vaultId || !item || !folderId) return;

      return await window.electron.vault.restore.single({
        vaultId,
        folderId,
        item,
        dialogTitle: t("dialog.title"),
      });
    },
    onError: showErrorToast,
    onSuccess: async (res) => {
      if (res === true) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.folder.restores(folderId),
        });
      }
    },
  });
}
