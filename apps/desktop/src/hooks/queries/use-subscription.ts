import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

type UseSubscriptionOptions = {
  refetchInterval?: number;
};

export function useSubscription(options?: UseSubscriptionOptions) {
  const { queryKeys, accountId } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.subscription.detail(),
    queryFn: () => {
      return trpc.payment.getSubscription.query();
    },
    refetchInterval: options?.refetchInterval,
    enabled: !!accountId,
  });
}
