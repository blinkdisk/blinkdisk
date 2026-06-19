import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { type ProfileFilter, useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useStartBackup(
  options: { profileFilter?: ProfileFilter } = {},
) {
  const queryClient = useQueryClient();

  const { vaultId } = useVaultId();
  const { profileFilter: routeProfileFilter } = useProfile();
  const { queryKeys } = useQueryKey();
  const profileFilter =
    options.profileFilter === undefined
      ? routeProfileFilter
      : options.profileFilter;

  return useMutation({
    mutationKey: ["vault", vaultId, "backup"],
    mutationFn: async (options: { path?: string }) => {
      if (!vaultId || !profileFilter)
        throw new CustomError("MISSING_REQUIRED_VALUE");

      await vaultApi(vaultId).post(
        "/api/v1/sources/upload",
        {},
        {
          params: {
            ...profileFilter,
            ...(options?.path && { path: options.path }),
          },
        },
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
