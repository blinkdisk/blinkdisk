import { useVault } from "@desktop/hooks/queries/use-vault";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export function useVaultSpace() {
  const { accountId } = useAccountId();
  const { data: vault } = useVault();

  return useQuery({
    queryKey: [accountId, "vault", vault?.id, "space"],
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
