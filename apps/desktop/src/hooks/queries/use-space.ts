import { useAccountId } from "@desktop/hooks/use-account-id";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export function useSpace() {
  const { isOnlineAccount } = useAccountId();
  const { queryKeys } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.space,
    queryFn: () => {
      return trpc.cloudblink.space.query();
    },
    refetchOnMount: false,
    enabled: !!isOnlineAccount,
  });
}
