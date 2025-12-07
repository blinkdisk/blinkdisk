import { useVaultPolicy } from "@desktop/hooks/queries/core/use-vault-policy";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useDevice } from "@desktop/hooks/use-device";
import { useFolder } from "@desktop/hooks/use-folder";
import { useProfile } from "@desktop/hooks/use-profile";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { convertPolicyFromCore, mergeFolderPolicy } from "@desktop/lib/policy";
import { useQuery } from "@tanstack/react-query";

export function useFolderPolicy({ folderId }: { folderId?: string }) {
  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { accountId } = useAccountId();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();

  const { data: folder } = useFolder(folderId);
  const { data: vaultPolicy } = useVaultPolicy();

  return useQuery({
    queryKey: [accountId, "core", "policy", folder?.id],
    queryFn: async () => {
      if (!deviceId || !profileId || !vaultId || !folder || !vaultPolicy)
        return null;

      const data = await window.electron.vault.fetch({
        vaultId: vaultId!,
        method: "GET",
        path: "/api/v1/policy",
        search: {
          userName: profileId,
          host: deviceId,
          path: folder.source.path,
        },
      });

      if (!data) return null;
      if (data.error) throw new Error(data.error);

      const folderPolicy = convertPolicyFromCore(data, "FOLDER");
      if (!folderPolicy) return null;

      return mergeFolderPolicy(folderPolicy, vaultPolicy);
    },
    refetchInterval: 1000,
    enabled: !!accountId && !!vaultId && !!folder && !!vaultPolicy && running,
  });
}
