import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useFolderId } from "@desktop/hooks/use-folder-id";
import { useQuery } from "@tanstack/react-query";

export function useRestoreList() {
  const { accountId } = useAccountId();
  const { folderId } = useFolderId();
  const { running } = useVaultStatus();

  return useQuery({
    queryKey: [accountId, "restore", "list", folderId],
    queryFn: async () => {
      return await window.electron.vault.restore.list({
        folderId: folderId!,
      });
    },
    refetchInterval: 1000,
    enabled: !!accountId && !!folderId && running,
  });
}
