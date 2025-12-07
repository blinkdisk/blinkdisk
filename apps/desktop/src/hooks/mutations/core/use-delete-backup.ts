import { useAccountId } from "@desktop/hooks/use-account-id";
import { useDevice } from "@desktop/hooks/use-device";
import { useFolder } from "@desktop/hooks/use-folder";
import { useProfile } from "@desktop/hooks/use-profile";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteBackup({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const { data: folder } = useFolder();
  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { accountId } = useAccountId();
  const { vaultId } = useVaultId();

  return useMutation({
    mutationKey: ["core", "backup", "delete"],
    mutationFn: async ({ backupId }: { backupId: string }) => {
      const data = await window.electron.vault.fetch({
        vaultId: vaultId!,
        method: "POST",
        path: "/api/v1/snapshots/delete",
        data: {
          source: {
            path: folder?.source.path || "",
            userName: profileId || "",
            host: deviceId || "",
          },
          snapshotManifestIds: [backupId],
          deleteSourceAndPolicy: false,
        },
      });

      return data;
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [accountId, "core", "backup", "list", vaultId],
      });

      onSuccess?.();
    },
  });
}
