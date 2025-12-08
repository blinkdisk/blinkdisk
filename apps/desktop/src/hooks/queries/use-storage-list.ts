import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type StorageListItem = Awaited<
  ReturnType<typeof trpc.storage.list.query>
>[number];

export function useStorageList() {
  const { queryKeys, accountId } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.storage.list(),
    queryFn: () => {
      return trpc.storage.list.query();
    },
    enabled: !!accountId,
  });
}
