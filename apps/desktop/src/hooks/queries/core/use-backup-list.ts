import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useDevice } from "@desktop/hooks/use-device";
import { useFolder } from "@desktop/hooks/use-folder";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";

export type CoreBackupItem = {
  id: string;
  description: string;
  startTime: string;
  endTime: string;
  incomplete?: "checkpoint";
  summary: {
    size: number;
    files: number;
    symlinks: number;
    dirs: number;
    maxTime: string;
    numFailed: number;
  };
  rootID: string;
  retention: string[];
  pins: string[];
};

export function useBackupList() {
  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { queryKeys, accountId } = useQueryKey();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();
  const { data: folder } = useFolder();

  return useQuery({
    queryKey: queryKeys.backup.list(folder?.id),
    queryFn: async () => {
      const res = await vaultApi(vaultId).get<{
        snapshots: CoreBackupItem[];
        unfilteredCount: number;
        uniqueCount: number;
        error?: string;
      }>("/api/v1/snapshots", {
        params: {
          path: folder?.source.path || "",
          userName: profileId || "",
          host: deviceId || "",
          all: "1",
        },
      });

      if (res.status !== 200) throw new Error(res.data.error);

      return res.data.snapshots.reverse();
    },
    refetchInterval: 1000,
    enabled: !!accountId && !!vaultId && !!folder && running,
  });
}
