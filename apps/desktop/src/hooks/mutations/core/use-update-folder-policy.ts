import { useVaultPolicy } from "@desktop/hooks/queries/core/use-vault-policy";
import { useDevice } from "@desktop/hooks/use-device";
import { useFolder } from "@desktop/hooks/use-folder";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { getFolderPolicyUpdates } from "@desktop/lib/policy";
import { vaultApi } from "@desktop/lib/vault";
import { ZPolicyType } from "@schemas/policy";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateFolderPolicy({
  folderId,
  onSuccess,
}: {
  folderId?: string;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const { queryKeys } = useQueryKey();
  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { vaultId } = useVaultId();
  const { data: vaultPolicy } = useVaultPolicy();
  const { data: folder } = useFolder(folderId);

  return useMutation({
    mutationKey: ["core", "vault", folder?.id, "policy"],
    mutationFn: async (values: ZPolicyType) => {
      if (!deviceId || !profileId || !vaultId || !folder || !vaultPolicy)
        return;

      const update = getFolderPolicyUpdates(vaultPolicy, values);

      const res = await vaultApi(vaultId).put("/api/v1/policy", update, {
        params: {
          userName: profileId,
          host: deviceId,
          path: folder.source.path,
        },
      });

      if (res.data.error) throw new Error(res.data.error);
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.policy.folder(folder?.id),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.folder.list(vaultId),
        }),
      ]);

      onSuccess?.();
    },
  });
}
