import { CustomError } from "@blinkdisk/utils/error";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { useQuery } from "@tanstack/react-query";

export function useVaultStatus(vaultIdOverride?: string) {
  const { queryKeys } = useQueryKey();
  const { vaultId: routeVaultId } = useVaultId();
  const vaultId = vaultIdOverride ?? routeVaultId;

  const query = useQuery({
    queryKey: queryKeys.vault.status(vaultId),
    queryFn: async () => {
      if (!vaultId) throw new CustomError("MISSING_REQUIRED_VALUE");

      const res = await window.electron.vault.status(vaultId);

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
