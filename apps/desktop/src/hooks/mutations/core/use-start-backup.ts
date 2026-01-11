import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { vaultApi } from "@desktop/lib/vault";
import { CustomError } from "@utils/error";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useStartBackup() {
  const queryClient = useQueryClient();

  const { vaultId } = useVaultId();
  const { profileFilter } = useProfile();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["vault", vaultId, "backup"],
    mutationFn: async (options: { path?: string }) => {
      if (!vaultId) throw new CustomError("MISSING_REQUIRED_VALUE");

      await vaultApi(vaultId).post(
        "/api/v1/sources/upload",
        {},
        {
          params: {
            ...profileFilter,
            ...(options && options.path && { path: options.path }),
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
