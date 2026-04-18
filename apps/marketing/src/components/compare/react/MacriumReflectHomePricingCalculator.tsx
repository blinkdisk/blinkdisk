import { Tabs, TabsList, TabsTrigger } from "@blinkdisk/ui/tabs";
import { useState } from "react";

type BillingPeriod = "1_YEAR" | "3_YEARS";

const prices: Record<BillingPeriod, { amount: number; label: string }> = {
  "1_YEAR": { amount: 41.99, label: "/year" },
  "3_YEARS": { amount: 113.37, label: "/3 years" },
};

export default function MacriumReflectHomePricingCalculator() {
  const [period, setPeriod] = useState<BillingPeriod>("1_YEAR");

  const { amount, label } = prices[period];

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card rounded-xl border p-4">
        <p className="text-lg font-semibold">Macrium Reflect X Home</p>
        <p className="text-muted-foreground text-sm">
          Complete backup solution for personal use
        </p>

        <Tabs
          value={period}
          onValueChange={(value) => setPeriod(value as BillingPeriod)}
          className="mt-5"
        >
          <TabsList className="w-full">
            <TabsTrigger value="1_YEAR">1 Year</TabsTrigger>
            <TabsTrigger value="3_YEARS">3 Years</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-5 flex items-baseline gap-1">
          <span className="text-3xl font-bold">
            {amount.toLocaleString(undefined, {
              style: "currency",
              currency: "EUR",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-muted-foreground">{label}</span>
        </div>
      </div>
    </div>
  );
}
