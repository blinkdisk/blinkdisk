import { useDevice } from "@desktop/hooks/use-device";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useBackupFolder() {
  const queryClient = useQueryClient();

  const { vaultId } = useVaultId();
  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["folder", "backup"],
    mutationFn: async ({ path }: { path: string }) => {
      if (!vaultId) return;

      const res = await vaultApi(vaultId).post(
        "/api/v1/sources/upload",
        {},
        {
          params: {
            userName: profileId!,
            host: deviceId!,
            path: path,
          },
        },
      );

      if (res.data.error) throw new Error(res.data.error);
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.folder.list(vaultId),
        }),
      ]);
    },
  });
}
