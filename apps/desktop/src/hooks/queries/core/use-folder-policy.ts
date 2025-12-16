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
  emptyPolicy,
  getDefinedFields,
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
  mock?: {
    path: string;
  };
}) {
  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { queryKeys, accountId } = useQueryKey();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();

  const { data: folder } = useFolder(folderId);
  const { data: vaultPolicy } = useVaultPolicy();

  return useQuery({
    queryKey: queryKeys.policy.folder(mock ? "mock" : folderId),
    queryFn: async () => {
      if (!deviceId || !profileId || !vaultId || !vaultPolicy) return null;

      const res = await vaultApi(vaultId).post<{
        defined: CorePolicy;
        effective: CorePolicy;
      }>(
        "/api/v1/policy/resolve",
        {
          ...(mock ? { updates: window.folderMockPolicy || {} } : {}),
          numUpcomingSnapshotTimes: 0,
        },
        {
          params: {
            userName: profileId,
            host: deviceId,
            path: mock ? mock.path : folder ? folder.source.path : "unknown",
          },
        },
      );

      if (!res.data) return null;

      const defined = mock
        ? window.folderMockPolicy
          ? convertPolicyFromCore(window.folderMockPolicy)
          : emptyPolicy
        : convertPolicyFromCore(res.data.defined);

      if (!defined) return null;

      const effective = convertPolicyFromCore(res.data.effective);
      const definedFields = getDefinedFields(defined);

      return {
        defined,
        effective,
        definedFields,
      };
    },
    enabled:
      !!accountId &&
      !!vaultId &&
      !!vaultPolicy &&
      running &&
      (!!folder || !!mock),
  });
}
