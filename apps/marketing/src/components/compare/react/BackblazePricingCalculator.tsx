import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import { useState } from "react";

type BillingPeriod = "MONTHLY" | "YEARLY" | "TWO_YEARS";

const prices: Record<BillingPeriod, { amount: number; label: string }> = {
  MONTHLY: { amount: 9, label: "/month" },
  YEARLY: { amount: 99, label: "/year" },
  TWO_YEARS: { amount: 189, label: "/2 years" },
};

export default function BackblazePricingCalculator() {
  const [period, setPeriod] = useState<BillingPeriod>("YEARLY");

  const { amount, label } = prices[period];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-card p-4">
        <p className="text-lg font-semibold">Backblaze</p>
        <p className="text-sm text-muted-foreground">Unlimited storage per computer</p>

        <Tabs
          value={period}
          onValueChange={(value) => setPeriod(value as BillingPeriod)}
          className="mt-5"
        >
          <TabsList className="w-full">
            <TabsTrigger value="MONTHLY">Monthly</TabsTrigger>
            <TabsTrigger value="YEARLY">Yearly</TabsTrigger>
            <TabsTrigger value="TWO_YEARS">2 Years</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-5 flex items-baseline gap-1">
          <span className="text-3xl font-bold">
            {amount.toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
          <span className="text-muted-foreground">{label}</span>
        </div>
      </div>
    </div>
  );
}
