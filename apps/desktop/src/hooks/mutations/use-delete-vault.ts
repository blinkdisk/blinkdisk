import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { getVaultCollection } from "@desktop/lib/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteVault({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const { queryKeys } = useQueryKey();
  const { accountId } = useAccountId();

  return useMutation({
    mutationKey: ["vault", "delete"],
    mutationFn: async ({ vaultId }: { vaultId: string }) => {
      getVaultCollection(accountId).updateOne(
        {
          id: vaultId,
        },
        {
          $set: {
            status: "DELETED",
          },
        },
      );
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.vault.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.space,
        }),
      ]);

      onSuccess?.();
    },
  });
}
