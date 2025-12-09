import { useDevice } from "@desktop/hooks/use-device";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteFolder({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();

  return useMutation({
    mutationKey: ["core", "folder", "delete"],
    mutationFn: async ({ path }: { path: string }) => {
      const res = await vaultApi(vaultId).post("/api/v1/snapshots/delete", {
        source: {
          path: path || "",
          userName: profileId || "",
          host: deviceId || "",
        },
        snapshotManifestIds: [],
        deleteSourceAndPolicy: true,
      });

      if (res.data.error) throw new Error(res.data.error);
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.folder.list(vaultId),
      });

      onSuccess?.();
    },
  });
}
