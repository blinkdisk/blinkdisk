import { useVaultStatus } from "#hooks/queries/use-vault-status";
import { useQueryKey } from "#hooks/use-query-key";
import { useVaultId } from "#hooks/use-vault-id";
import { convertThrottleFromCore, CoreThrottle } from "#lib/throttle";
import { vaultApi } from "#lib/vault";
import { useQuery } from "@tanstack/react-query";

export function useVaultThrottle() {
  const { queryKeys, accountId } = useQueryKey();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();

  return useQuery({
    queryKey: queryKeys.vault.throttle(vaultId),
    queryFn: async () => {
      if (!vaultId) return null;

      const res = await vaultApi(vaultId).get<CoreThrottle>(
        "/api/v1/repo/throttle",
      );

      if (!res.data) return null;

      return convertThrottleFromCore(res.data);
    },
    enabled: !!accountId && !!vaultId && running,
  });
}
