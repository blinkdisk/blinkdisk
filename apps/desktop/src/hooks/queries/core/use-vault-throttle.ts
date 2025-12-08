import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { convertThrottleFromCore } from "@desktop/lib/throttle";
import { useQuery } from "@tanstack/react-query";

export function useVaultThrottle() {
  const { queryKeys, accountId } = useQueryKey();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();

  return useQuery({
    queryKey: queryKeys.vault.throttle(vaultId),
    queryFn: async () => {
      if (!vaultId) return null;

      const data = await window.electron.vault.fetch({
        vaultId: vaultId!,
        method: "GET",
        path: "/api/v1/repo/throttle",
      });

      if (!data) return null;
      if (data.error) throw new Error(data.error);

      return convertThrottleFromCore(data);
    },
    refetchInterval: 1000,
    enabled: !!accountId && !!vaultId && running,
  });
}
