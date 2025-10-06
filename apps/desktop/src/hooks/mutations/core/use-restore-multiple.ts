import { DirectoryItem } from "@desktop/hooks/queries/core/use-directory";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useFolderId } from "@desktop/hooks/use-folder-id";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { useAppTranslation } from "@hooks/use-app-translation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";

export function useRestoreMultiple(items: DirectoryItem[] | undefined) {
  const queryClient = useQueryClient();

  const { vaultId } = useVaultId();
  const { folderId } = useFolderId();
  const { accountId } = useAccountId();
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
          queryKey: [accountId, "restore", "list", folderId],
        });

      toast.success(t("success.title"), {
        description: t("success.description"),
      });
    },
  });
}
