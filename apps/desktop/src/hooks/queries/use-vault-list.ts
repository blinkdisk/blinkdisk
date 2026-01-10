import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type VaultListItem = Awaited<
  ReturnType<typeof trpc.vault.list.query>
>[number];

export function useVaultList() {
  const { queryKeys, accountId } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.vault.list(),
    queryFn: () => {
      return trpc.vault.list.query();
    },
    enabled: !!accountId,
  });
}
