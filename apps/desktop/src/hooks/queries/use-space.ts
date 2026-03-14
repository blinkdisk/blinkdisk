import { useQueryKey } from "#hooks/use-query-key";
import { trpc } from "#lib/trpc";
import { useQuery } from "@tanstack/react-query";

export function useSpace() {
  const { queryKeys, accountId } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.space,
    queryFn: () => {
      return trpc.vault.space.query();
    },
    refetchOnMount: false,
    enabled: !!accountId,
  });
}
