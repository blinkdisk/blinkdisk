import { useProfile } from "#hooks/use-profile";
import { useQueryKey } from "#hooks/use-query-key";
import { useVaultId } from "#hooks/use-vault-id";
import { showErrorToast } from "#lib/error";
import { vaultApi } from "#lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomError } from "@utils/error";

export function useDeleteFolder({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const { profileFilter } = useProfile();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();

  return useMutation({
    mutationKey: ["core", "folder", "delete"],
    mutationFn: async ({ path }: { path: string }) => {
      if (!vaultId || !profileFilter)
        throw new CustomError("MISSING_REQUIRED_VALUE");

      await vaultApi(vaultId).post("/api/v1/snapshots/delete", {
        source: {
          ...profileFilter,
          path: path || "",
        },
        snapshotManifestIds: [],
        deleteSourceAndPolicy: true,
      });
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.folder.list(vaultId, profileFilter),
      });

      onSuccess?.();
    },
  });
}
