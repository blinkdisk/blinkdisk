import { useAccountId } from "@desktop/hooks/use-account-id";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type VaultListItem = Awaited<
  ReturnType<typeof trpc.vault.list.query>
>[number];

export function useVaultList() {
  const { accountId } = useAccountId();

  return useQuery({
    queryKey: [accountId, "vault", "list"],
    queryFn: () => {
      return trpc.vault.list.query({});
    },
    enabled: !!accountId,
  });
}
