import { useAccountId } from "@desktop/hooks/use-account-id";
import { useFolderId } from "@desktop/hooks/use-folder-id";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZRestoreDirectoryType } from "@schemas/directory";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useRestoreDirectory({
  onSuccess,
  objectId,
}: {
  objectId: string | undefined;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();

  const { t } = useAppTranslation("directory.restoreDialog");
  const { vaultId } = useVaultId();
  const { folderId } = useFolderId();
  const { accountId } = useAccountId();

  return useMutation({
    mutationKey: ["account", "details"],
    mutationFn: async (values: ZRestoreDirectoryType) => {
      if (!vaultId || !folderId || !objectId) return;

      return await window.electron.vault.restore.directory({
        vaultId,
        folderId,
        options: values,
        objectId,
      });
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [accountId, "restore", "list", folderId],
      });

      toast.success(t("success.title"), {
        description: t("success.description"),
      });

      onSuccess?.();
    },
  });
}
