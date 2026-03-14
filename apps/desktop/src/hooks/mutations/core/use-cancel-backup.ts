import { useProfile } from "#hooks/use-profile";
import { useQueryKey } from "#hooks/use-query-key";
import { useVaultId } from "#hooks/use-vault-id";
import { showErrorToast } from "#lib/error";
import { vaultApi } from "#lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomError } from "@blinkdisk/utils/error";

export function useCancelBackup() {
  const queryClient = useQueryClient();

  const { profileFilter } = useProfile();
  const { vaultId } = useVaultId();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["vault", vaultId, "backup", "cancel"],
    mutationFn: async (options: { taskId?: string }) => {
      if (!vaultId) throw new CustomError("MISSING_REQUIRED_VALUE");

      await vaultApi(vaultId).post(
        `/api/v1/tasks/${options.taskId}/cancel`,
        {},
      );
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.folder.list(vaultId, profileFilter),
      });
    },
  });
}
