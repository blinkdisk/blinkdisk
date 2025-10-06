import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useDevice } from "@desktop/hooks/use-device";
import { useFolder } from "@desktop/hooks/use-folder";
import { useProfile } from "@desktop/hooks/use-profile";
import { useVaultId } from "@desktop/hooks/use-vault-id";
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
  const { accountId } = useAccountId();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();
  const { data: folder } = useFolder();

  return useQuery({
    queryKey: [
      accountId,
      "core",
      "backup",
      "list",
      folder?.source.path,
      vaultId,
    ],
    queryFn: async () => {
      const data = (await window.electron.vault.fetch({
        vaultId: vaultId!,
        method: "GET",
        path: "/api/v1/snapshots",
        search: {
          path: folder?.source.path || "",
          userName: profileId || "",
          host: deviceId || "",
          all: "1",
        },
      })) as { snapshots: CoreBackupItem[] };

      return data.snapshots.reverse();
    },
    refetchInterval: 1000,
    enabled: !!accountId && !!vaultId && !!folder && running,
  });
}
