import { useAccountId } from "@desktop/hooks/use-account-id";
import { useDevice } from "@desktop/hooks/use-device";
import { useFolder } from "@desktop/hooks/use-folder";
import { useProfile } from "@desktop/hooks/use-profile";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useBackupFolder() {
  const queryClient = useQueryClient();

  const { vaultId } = useVaultId();
  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { accountId } = useAccountId();
  const { data: folder } = useFolder();

  return useMutation({
    mutationKey: ["folder", folder?.id, "backup"],
    mutationFn: async () => {
      if (!vaultId || !folder) return;

      return await window.electron.vault.fetch({
        vaultId,
        method: "POST",
        path: "/api/v1/sources/upload",
        search: {
          userName: profileId!,
          host: deviceId!,
          path: folder.source.path,
        },
      });
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [accountId, "core", "folder", "list", vaultId],
        }),
      ]);
    },
  });
}
