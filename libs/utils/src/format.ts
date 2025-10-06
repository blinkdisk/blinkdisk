export function formatSubscriptionEn(
  plan:
    | {
        storageGB: number;
      }
    | undefined,
  price:
    | {
        amount: number;
        currency: string;
        period: "MONTHLY" | "YEARLY" | string;
      }
    | undefined,
) {
  return `${plan?.storageGB.toLocaleString() || "?"} GB (${price ? formatAmount(price.amount, price.currency) : "?"}/${!price ? "?" : price.period === "MONTHLY" ? "mo" : price.period === "YEARLY" ? "yr" : "-"})`;
}

export function formatAmount(amount: string | number, currency: string) {
  return Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    style: "currency",
    currency,
  });
}
