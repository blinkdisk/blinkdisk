import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { useQuery } from "@tanstack/react-query";

export function useVaultStatus() {
  const { queryKeys, accountId } = useQueryKey();
  const { vaultId } = useVaultId();

  const query = useQuery({
    queryKey: queryKeys.vault.status(vaultId),
    queryFn: async () => {
      const res = await window.electron!.vault.status(vaultId!);

      if (!res) return null;
      return res;
    },
    enabled: !!accountId && !!vaultId,
    retry: true,
    refetchInterval: 1000,
  });

  return {
    ...query,
    running: query.data === "RUNNING",
  };
}
