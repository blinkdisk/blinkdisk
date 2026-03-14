import { useProfile } from "#hooks/use-profile";
import { useQueryKey } from "#hooks/use-query-key";
import { useVaultId } from "#hooks/use-vault-id";
import { showErrorToast } from "#lib/error";
import { vaultApi } from "#lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomError } from "@utils/error";

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
