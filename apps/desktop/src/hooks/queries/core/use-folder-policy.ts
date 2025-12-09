import { useVaultPolicy } from "@desktop/hooks/queries/core/use-vault-policy";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useDevice } from "@desktop/hooks/use-device";
import { useFolder } from "@desktop/hooks/use-folder";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import {
  convertPolicyFromCore,
  CorePolicy,
  mergeFolderPolicy,
} from "@desktop/lib/policy";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";

export function useFolderPolicy({ folderId }: { folderId?: string }) {
  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { queryKeys, accountId } = useQueryKey();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();

  const { data: folder } = useFolder(folderId);
  const { data: vaultPolicy } = useVaultPolicy();

  return useQuery({
    queryKey: queryKeys.policy.folder(folder?.id),
    queryFn: async () => {
      if (!deviceId || !profileId || !vaultId || !folder || !vaultPolicy)
        return null;

      const res = await vaultApi(vaultId).get<CorePolicy & { error?: string }>(
        "/api/v1/policy",
        {
          params: {
            userName: profileId,
            host: deviceId,
            path: folder.source.path,
          },
        },
      );

      if (res.status !== 200) throw new Error(res.data.error);

      if (!res.data) return null;
      if (res.data.error) throw new Error(res.data.error);

      const folderPolicy = convertPolicyFromCore(res.data, "FOLDER");
      if (!folderPolicy) return null;

      return mergeFolderPolicy(folderPolicy, vaultPolicy);
    },
    enabled: !!accountId && !!vaultId && !!folder && !!vaultPolicy && running,
  });
}
