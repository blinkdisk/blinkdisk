import { useAccountId } from "@desktop/hooks/use-account-id";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { useQuery } from "@tanstack/react-query";

export function useVaultStatus() {
  const { accountId } = useAccountId();
  const { vaultId } = useVaultId();

  const query = useQuery({
    queryKey: [accountId, "vault", "status", vaultId],
    queryFn: async () => {
      const res = await window.electron!.vault.status({
        vaultId: vaultId!,
      });

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
