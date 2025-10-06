import { useAccountId } from "@desktop/hooks/use-account-id";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export function useBilling() {
  const { accountId } = useAccountId();

  return useQuery({
    queryKey: [accountId, "billing"],
    queryFn: () => {
      return trpc.payment.billing.query();
    },
    enabled: !!accountId,
  });
}
