import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useFolderId } from "@desktop/hooks/use-folder-id";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useQuery } from "@tanstack/react-query";

export function useRestoreList() {
  const { queryKeys, accountId } = useQueryKey();
  const { folderId } = useFolderId();
  const { running } = useVaultStatus();

  return useQuery({
    queryKey: queryKeys.folder.restores(folderId),
    queryFn: async () => {
      return await window.electron.vault.restore.list({
        folderId: folderId!,
      });
    },
    refetchInterval: 1000,
    enabled: !!accountId && !!folderId && running,
  });
}
