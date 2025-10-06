import { useAccountId } from "@desktop/hooks/use-account-id";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { convertPolicyToCore } from "@desktop/lib/policy";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZPolicyType } from "@schemas/policy";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateVaultPolicy(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { t } = useAppTranslation("policy.update");
  const { accountId } = useAccountId();
  const { vaultId } = useVaultId();

  return useMutation({
    mutationKey: ["core", "vault", vaultId, "policy"],
    mutationFn: async (values: ZPolicyType) => {
      const data = await window.electron.vault.fetch({
        vaultId: vaultId!,
        method: "PUT",
        path: "/api/v1/policy",
        data: convertPolicyToCore(values, "VAULT"),
      });

      return data;
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [accountId, "core", "policy", vaultId],
      });

      toast.success(t("success.title"), {
        description: t("success.description"),
      });

      onSuccess?.();
    },
  });
}
