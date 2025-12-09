import { useDevice } from "@desktop/hooks/use-device";
import { useFolder } from "@desktop/hooks/use-folder";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteBackup({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const { data: folder } = useFolder();
  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();

  return useMutation({
    mutationKey: ["core", "backup", "delete"],
    mutationFn: async ({ backupId }: { backupId: string }) => {
      const res = await vaultApi(vaultId).post("/api/v1/snapshots/delete", {
        source: {
          path: folder?.source.path || "",
          userName: profileId || "",
          host: deviceId || "",
        },
        snapshotManifestIds: [backupId],
        deleteSourceAndPolicy: false,
      });

      if (res.data.error) throw new Error(res.data.error);
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
