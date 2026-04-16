import { isDemoMode } from "@desktop/lib/demo";
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
    enabled: !isDemoMode && !!vaultId,
    retry: true,
    refetchInterval: isDemoMode ? false : 1000,
  });

  if (isDemoMode) {
    return {
      ...query,
      status: "RUNNING" as const,
      initTask: undefined,
      running: true,
    };
  }

  return {
    ...query,
    status: query.data?.status,
    initTask: query.data?.initTask,
    running: query.data?.status === "RUNNING",
  };
}
