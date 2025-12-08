import { useVaultPolicy } from "@desktop/hooks/queries/core/use-vault-policy";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useDevice } from "@desktop/hooks/use-device";
import { useFolder } from "@desktop/hooks/use-folder";
import { useProfile } from "@desktop/hooks/use-profile";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { getFolderPolicyUpdates } from "@desktop/lib/policy";
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

  const { accountId } = useAccountId();
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

      const data = await window.electron.vault.fetch({
        vaultId: vaultId!,
        method: "PUT",
        path: "/api/v1/policy",
        data: update,
        search: {
          userName: profileId,
          host: deviceId,
          path: folder.source.path,
        },
      });

      return data;
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [accountId, "core", "policy", folder?.id],
        }),
        queryClient.invalidateQueries({
          queryKey: [accountId, "core", "folder", "list", vaultId],
        }),
      ]);

      onSuccess?.();
    },
  });
}
