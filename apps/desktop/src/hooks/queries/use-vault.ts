import { useAccountId } from "@desktop/hooks/use-account-id";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type VaultItem = Awaited<ReturnType<typeof trpc.vault.get.query>>;

export function useVault() {
  const { accountId } = useAccountId();
  const { vaultId } = useVaultId();

  return useQuery({
    queryKey: [accountId, "vault", vaultId],
    queryFn: () => {
      return trpc.vault.get.query({
        vaultId: vaultId!,
      });
    },
    enabled: !!accountId && !!vaultId,
  });
}
