import { useAccountId } from "@desktop/hooks/use-account-id";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { convertThrottleToCore } from "@desktop/lib/throttle";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZVaultThrottleType } from "@schemas/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateThrottle(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { t } = useAppTranslation("vault.updateThrottle");
  const { accountId } = useAccountId();
  const { vaultId } = useVaultId();

  return useMutation({
    mutationKey: ["core", "vault", vaultId, "policy"],
    mutationFn: async (values: ZVaultThrottleType) => {
      const data = await window.electron.vault.fetch({
        vaultId: vaultId!,
        method: "PUT",
        path: "/api/v1/repo/throttle",
        data: convertThrottleToCore(values),
      });

      return data;
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [accountId, "core", "throttle", vaultId],
      });

      toast.success(t("success.title"), {
        description: t("success.description"),
      });

      onSuccess?.();
    },
  });
}
