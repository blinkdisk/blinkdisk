import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
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
