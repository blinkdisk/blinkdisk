import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useBackup } from "@desktop/hooks/use-backup";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { useQuery } from "@tanstack/react-query";

export type CoreMountItem = {
  path: string;
  root: string;
};

export function useMount() {
  const { accountId } = useAccountId();
  const { running } = useVaultStatus();
  const { vaultId } = useVaultId();
  const { data: backup } = useBackup();

  return useQuery({
    queryKey: [accountId, "core", "mount", backup?.rootID],
    queryFn: async () => {
      const data = (await window.electron.vault.fetch({
        vaultId: vaultId!,
        method: "GET",
        path: `/api/v1/mounts/${backup?.rootID}`,
      })) as CoreMountItem | { code: "NOT_FOUND" };

      if ("code" in data && data.code == "NOT_FOUND") return null;
      return data as CoreMountItem;
    },
    enabled: !!accountId && !!vaultId && !!backup && running,
  });
}
