import { useQueryKey } from "@desktop/hooks/use-query-key";
import { showErrorToast } from "@desktop/lib/error";
import { trpc } from "@desktop/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteVault({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["core", "vault", "delete"],
    mutationFn: async ({ vaultId }: { vaultId: string }) => {
      await trpc.vault.delete.mutate({
        vaultId,
      });
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
