import { ZUpdateVaultFormType } from "@blinkdisk/schemas/vault";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { getVaultCollection } from "@desktop/lib/db";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateVault(onSuccess: () => void) {
  const queryClient = useQueryClient();
  const { vaultId } = useVaultId();
  const { queryKeys } = useQueryKey();
  const { accountId } = useAccountId();

  return useMutation({
    mutationKey: ["vault", vaultId, "name"],
    mutationFn: async (values: ZUpdateVaultFormType) => {
      await vaultApi(vaultId).post("/api/v1/repo/description", {
        description: values.name,
      });

      getVaultCollection(accountId).updateOne(
        {
          id: vaultId!,
        },
        {
          $set: {
            name: values.name,
          },
        },
      );
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.vault.detail(vaultId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.vault.list(),
        }),
      ]);

      onSuccess?.();
    },
  });
}
