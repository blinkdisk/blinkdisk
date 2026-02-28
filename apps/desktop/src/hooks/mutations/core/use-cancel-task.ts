import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomError } from "@utils/error";

export function useCancelTask() {
  const { vaultId } = useVaultId();
  const { queryKeys } = useQueryKey();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["core", "task", "cancel"],
    mutationFn: async ({ taskId }: { taskId: string }) => {
      if (!vaultId) throw new CustomError("MISSING_REQUIRED_VALUE");

      await vaultApi(vaultId).post(`/api/v1/tasks/${taskId}/cancel`, {});
    },
    onError: showErrorToast,
    onSuccess: async (_, vars) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.task.single(vars.taskId),
      });
    },
  });
}
