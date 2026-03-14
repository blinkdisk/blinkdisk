import { useVaultPolicy } from "#hooks/queries/core/use-vault-policy";
import { useVaultStatus } from "#hooks/queries/use-vault-status";
import { useFolder } from "#hooks/use-folder";
import { useProfile } from "#hooks/use-profile";
import { useQueryKey } from "#hooks/use-query-key";
import { useVaultId } from "#hooks/use-vault-id";
import {
  convertPolicyFromCore,
  CorePolicy,
  emptyPolicy,
  getDefinedFields,
} from "#lib/policy";
import { vaultApi } from "#lib/vault";
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
  const { profileFilter } = useProfile();
  const { queryKeys, accountId } = useQueryKey();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();

  const { data: folder } = useFolder(folderId);
  const { data: vaultPolicy } = useVaultPolicy();

  return useQuery({
    queryKey: queryKeys.policy.folder(mock ? "mock" : folderId),
    queryFn: async () => {
      if (!profileFilter || !vaultId || !vaultPolicy) return null;

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
            ...profileFilter,
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
