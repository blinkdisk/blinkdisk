import { useAccountId } from "@desktop/hooks/use-account-id";
import { useDevice } from "@desktop/hooks/use-device";
import { useProfile } from "@desktop/hooks/use-profile";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteFolder({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { accountId } = useAccountId();
  const { vaultId } = useVaultId();

  return useMutation({
    mutationKey: ["core", "folder", "delete"],
    mutationFn: async ({ path }: { path: string }) => {
      const data = await window.electron.vault.fetch({
        vaultId: vaultId!,
        method: "POST",
        path: "/api/v1/snapshots/delete",
        data: {
          source: {
            path: path || "",
            userName: profileId || "",
            host: deviceId || "",
          },
          snapshotManifestIds: [],
          deleteSourceAndPolicy: true,
        },
      });

      return data;
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [accountId, "core", "folder", "list", vaultId],
      });

      onSuccess?.();
    },
  });
}
