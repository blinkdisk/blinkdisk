import { useVault } from "@desktop/hooks/queries/use-vault";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export function useVaultSpace() {
  const { queryKeys, accountId } = useQueryKey();
  const { data: vault } = useVault();

  return useQuery({
    queryKey: queryKeys.vault.space(vault?.id),
    queryFn: () => {
      if (!vault) return null;

      return trpc.vault.space.query({
        vaultId: vault.id!,
      });
    },
    refetchOnMount: false,
    enabled: !!accountId && !!vault && vault.provider === "BLINKDISK_CLOUD",
  });
}
