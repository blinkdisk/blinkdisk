import { useAccountId } from "@desktop/hooks/use-account-id";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { trpc } from "@desktop/lib/trpc";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZUpdateVaultFormType } from "@schemas/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateVault(onSuccess: () => void) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("vault.update");
  const { vaultId } = useVaultId();
  const { accountId } = useAccountId();

  return useMutation({
    mutationKey: ["vault", vaultId, "name"],
    mutationFn: async (values: ZUpdateVaultFormType) => {
      await window.electron.vault.fetch({
        vaultId: vaultId!,
        method: "POST",
        path: "/api/v1/repo/description",
        data: {
          description: values.name,
        },
      });

      const data = await trpc.vault.update.mutate({
        vaultId: vaultId!,
        name: values.name,
      });

      return data;
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [accountId, "vault", vaultId],
        }),
        queryClient.invalidateQueries({
          queryKey: [accountId, "vault", "list"],
        }),
      ]);

      toast.success(t("success.title"), {
        description: t("success.description"),
      });

      onSuccess?.();
    },
  });
}
