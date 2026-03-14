import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
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
