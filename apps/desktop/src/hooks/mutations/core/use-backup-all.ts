import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useDevice } from "@desktop/hooks/use-device";
import { useProfile } from "@desktop/hooks/use-profile";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useBackupAll() {
  const queryClient = useQueryClient();

  const { vaultId } = useVaultId();
  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["vault", vaultId, "backup"],
    mutationFn: async () => {
      if (!vaultId) return;

      return await window.electron.vault.fetch({
        vaultId,
        method: "POST",
        path: "/api/v1/sources/upload",
        search: {
          userName: profileId!,
          host: deviceId!,
        },
      });
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.folder.list(vaultId),
      });
    },
  });
}
