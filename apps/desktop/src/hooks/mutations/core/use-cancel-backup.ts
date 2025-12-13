import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCancelBackup() {
  const queryClient = useQueryClient();

  const { vaultId } = useVaultId();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["vault", vaultId, "backup", "cancel"],
    mutationFn: async (options: { taskId?: string }) => {
      if (!vaultId) return;

      await vaultApi(vaultId).post(
        `/api/v1/tasks/${options.taskId}/cancel`,
        {},
      );
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.folder.list(vaultId),
      });
    },
  });
}
