import { Plan } from "@config/plans";
import { useMemo } from "react";

export type BillingPeriod = "YEARLY" | "MONTHLY";

export function usePlanPrices(
  plan: Plan,
  period: BillingPeriod,
  currency: string,
) {
  const price = useMemo(
    () =>
      plan.prices.find(
        (price) => price.period === period && price.currency === currency,
      ),
    [plan, period, currency],
  );

  const savings = useMemo(() => {
    if (period === "MONTHLY" || !price || price.amount === 0) return null;

    const monthlyPrice = plan.prices.find(
      (price) => price.period === "MONTHLY" && price.currency === currency,
    );

    if (!monthlyPrice) return null;

    const original = monthlyPrice.amount;
    const yearly = original * 12 - price.amount;

    return {
      original,
      yearly,
    };
  }, [price, period, currency, plan.prices]);

  const monthlyAmount = useMemo(() => {
    if (!price) return null;
    if (period === "MONTHLY") return price.amount;
    return price.amount / 12;
  }, [price, period]);

  return {
    price,
    savings,
    monthlyAmount,
  };
}
