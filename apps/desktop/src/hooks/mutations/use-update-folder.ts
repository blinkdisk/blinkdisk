import { useAccountId } from "@desktop/hooks/use-account-id";
import { useFolderId } from "@desktop/hooks/use-folder-id";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { trpc } from "@desktop/lib/trpc";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZUpdateFolderFormType } from "@schemas/folder";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateFolder(onSuccess: () => void) {
  const queryClient = useQueryClient();

  const { t } = useAppTranslation("folder.update");
  const { folderId } = useFolderId();
  const { accountId } = useAccountId();
  const { vaultId } = useVaultId();

  return useMutation({
    mutationKey: ["folder", folderId],
    mutationFn: async (values: ZUpdateFolderFormType) => {
      if (!folderId) return;

      const data = await trpc.folder.update.mutate({
        ...values,
        folderId,
      });

      return data;
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [accountId, "folder", "list", vaultId],
      });

      toast.success(t("success.title"), {
        description: t("success.description"),
      });

      onSuccess?.();
    },
  });
}
