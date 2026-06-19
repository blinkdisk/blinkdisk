import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { type ProfileFilter, useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCancelBackup(
  options: { profileFilter?: ProfileFilter } = {},
) {
  const queryClient = useQueryClient();

  const { profileFilter: routeProfileFilter } = useProfile();
  const { vaultId } = useVaultId();
  const { queryKeys } = useQueryKey();
  const profileFilter =
    options.profileFilter === undefined
      ? routeProfileFilter
      : options.profileFilter;

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
