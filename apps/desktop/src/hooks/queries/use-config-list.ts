import { useQueryKey } from "#hooks/use-query-key";
import { trpc } from "#lib/trpc";
import { useQuery } from "@tanstack/react-query";

export function useConfigList() {
  const { queryKeys, accountId } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.config.list(),
    queryFn: () => {
      return trpc.config.list.query();
    },
    enabled: !!accountId,
  });
}
