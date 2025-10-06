import { useAccountId } from "@desktop/hooks/use-account-id";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type StorageListItem = Awaited<
  ReturnType<typeof trpc.storage.list.query>
>[number];

export function useStorageList() {
  const { accountId } = useAccountId();

  return useQuery({
    queryKey: [accountId, "storage", "list"],
    queryFn: () => {
      return trpc.storage.list.query();
    },
    enabled: !!accountId,
  });
}
