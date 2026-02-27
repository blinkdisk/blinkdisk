import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomError } from "@utils/error";

export function useCancelTask() {
  const { vaultId } = useVaultId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["core", "task", "cancel"],
    mutationFn: async ({ taskId }: { taskId: string }) => {
      if (!vaultId) throw new CustomError("MISSING_REQUIRED_VALUE");

      await vaultApi(vaultId).post(`/api/v1/tasks/${taskId}/cancel`, {});
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [undefined, "task"],
        exact: false,
      });
    },
  });
}
