import { useQueryKey } from "#hooks/use-query-key";
import { trpc } from "#lib/trpc";
import { useQuery } from "@tanstack/react-query";

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
