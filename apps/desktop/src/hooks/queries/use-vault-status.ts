import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { useQuery } from "@tanstack/react-query";

export function useVaultStatus() {
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();

  const query = useQuery({
    queryKey: queryKeys.vault.status(vaultId),
    queryFn: async () => {
      const res = await window.electron!.vault.status(vaultId!);

      if (!res) return null;
      return res;
    },
    enabled: !!vaultId,
    retry: true,
    refetchInterval: 1000,
  });

  return {
    ...query,
    status: query.data?.status,
    initTask: query.data?.initTask,
    running: query.data?.status === "RUNNING",
  };
}
