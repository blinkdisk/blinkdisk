import { useAccountId } from "@desktop/hooks/use-account-id";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export function useBilling() {
  const { isOnlineAccount } = useAccountId();
  const { queryKeys } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.billing.detail(),
    queryFn: () => {
      return trpc.payment.billing.query();
    },
    enabled: !!isOnlineAccount,
  });
}
