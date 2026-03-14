import { useQueryKey } from "#hooks/use-query-key";
import { useVaultId } from "#hooks/use-vault-id";
import { trpc } from "#lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type VaultItem = Awaited<ReturnType<typeof trpc.vault.get.query>>;

export function useVault(vaultId?: string) {
  const { queryKeys, accountId } = useQueryKey();
  const { vaultId: defaultVaultId } = useVaultId();

  return useQuery({
    queryKey: queryKeys.vault.detail(vaultId || defaultVaultId),
    queryFn: () => {
      return trpc.vault.get.query({
        vaultId: vaultId || defaultVaultId || "",
      });
    },
    enabled: !!accountId && !!(vaultId || defaultVaultId),
  });
}
