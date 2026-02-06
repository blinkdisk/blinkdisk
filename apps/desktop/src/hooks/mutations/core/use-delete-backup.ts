import { useFolder } from "@desktop/hooks/use-folder";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomError } from "@utils/error";

export function useDeleteBackup({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const { data: folder } = useFolder();
  const { profileFilter } = useProfile();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();

  return useMutation({
    mutationKey: ["core", "backup", "delete"],
    mutationFn: async ({ backupId }: { backupId: string }) => {
      if (!vaultId || !profileFilter)
        throw new CustomError("MISSING_REQUIRED_VALUE");

      await vaultApi(vaultId).post("/api/v1/snapshots/delete", {
        source: {
          ...profileFilter,
          path: folder?.source.path || "",
        },
        snapshotManifestIds: [backupId],
        deleteSourceAndPolicy: false,
      });
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.backup.list(folder?.id),
      });

      onSuccess?.();
    },
  });
}
