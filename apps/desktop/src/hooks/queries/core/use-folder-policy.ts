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
  emptyCorePolicy,
  mergeFolderPolicy,
} from "@desktop/lib/policy";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";

declare global {
  interface Window {
    folderMockPolicy?: CorePolicy;
  }
}

export function useFolderPolicy({
  folderId,
  mock,
}: {
  folderId?: string;
  mock?: boolean;
}) {
  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { queryKeys, accountId } = useQueryKey();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();

  const { data: folder } = useFolder(folderId);
  const { data: vaultPolicy } = useVaultPolicy();

  return useQuery({
    queryKey: queryKeys.policy.folder(folderId, mock),
    queryFn: async () => {
      if (!deviceId || !profileId || !vaultId || !vaultPolicy) return null;

      if (mock) {
        const converted = convertPolicyFromCore(
          window.folderMockPolicy || emptyCorePolicy,
          "FOLDER",
        );

        if (!converted) return null;
        return mergeFolderPolicy(converted, vaultPolicy);
      }

      if (!folder) return null;

      const res = await vaultApi(vaultId).get<CorePolicy>("/api/v1/policy", {
        params: {
          userName: profileId,
          host: deviceId,
          path: folder.source.path,
        },
      });

      if (!res.data) return null;

      const folderPolicy = convertPolicyFromCore(res.data, "FOLDER");
      if (!folderPolicy) return null;

      return mergeFolderPolicy(folderPolicy, vaultPolicy);
    },
    enabled:
      !!accountId &&
      !!vaultId &&
      !!vaultPolicy &&
      running &&
      (!!folder || mock),
  });
}
