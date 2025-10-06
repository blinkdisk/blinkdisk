import { useAccountId } from "@desktop/hooks/use-account-id";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export function useAPIFolderList() {
  const { accountId } = useAccountId();
  const { vaultId } = useVaultId();

  return useQuery({
    queryKey: [accountId, "folder", "list", vaultId],
    queryFn: async () => {
      if (!vaultId) return null;
      return trpc.folder.list.query({ vaultId });
    },
    enabled: !!accountId && !!vaultId,
  });
}
