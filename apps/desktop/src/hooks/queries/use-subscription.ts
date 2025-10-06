import { useAccountId } from "@desktop/hooks/use-account-id";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

type UseSubscriptionOptions = {
  refetchInterval?: number;
};

export function useSubscription(options?: UseSubscriptionOptions) {
  const { accountId } = useAccountId();

  return useQuery({
    queryKey: [accountId, "subscription"],
    queryFn: () => {
      return trpc.payment.getSubscription.query();
    },
    refetchInterval: options?.refetchInterval,
    enabled: !!accountId,
  });
}
