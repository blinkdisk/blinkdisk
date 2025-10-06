import { useSubscription } from "@desktop/hooks/queries/use-subscription";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { usePlanChange } from "@desktop/hooks/use-plan-change";
import { useEffect, useRef } from "react";

export function useSubscriptionWatch() {
  const previous = useRef<{ [accountId: string]: string | null }>({});

  const { accountId } = useAccountId();
  const { data: subscription, isLoading } = useSubscription();
  const { onPlanChange } = usePlanChange();

  useEffect(() => {
    if (!accountId || isLoading) return;

    const currentPrice = subscription ? subscription.priceId : null;
    const previousPrice = previous.current[accountId];
    if (previousPrice === currentPrice) return;

    if (
      previousPrice !== undefined &&
      currentPrice &&
      currentPrice !== previousPrice
    ) {
      onPlanChange(previousPrice ? "CHANGE" : "START");
    }

    previous.current[accountId] = currentPrice;
  }, [isLoading, accountId, subscription, onPlanChange]);
}
