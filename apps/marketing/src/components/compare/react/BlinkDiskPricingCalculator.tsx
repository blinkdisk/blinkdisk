import type { BillingPeriod } from "@blinkdisk/constants/plans";
import { SUBSCRIPTION_PLANS } from "@blinkdisk/constants/plans";
import { FREE_SPACE_AVAILABLE } from "@blinkdisk/constants/space";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@blinkdisk/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@blinkdisk/ui/tabs";
import FreePricingCalculator from "@marketing/components/compare/react/FreePricingCalculator";
import { useMemo, useState } from "react";

const currency = "USD";

const FREE_TIER_GB = FREE_SPACE_AVAILABLE / (1000 * 1000 * 1000);

export default function BlinkDiskPricingCalculator() {
  const [period, setPeriod] = useState<BillingPeriod>("YEARLY");
  const [planIndex, setPlanIndex] = useState(-1);

  const availablePlans = useMemo(() => SUBSCRIPTION_PLANS, []);
  const isFreeTier = planIndex === -1;
  const selectedPlan = isFreeTier ? null : availablePlans[planIndex];

  const price = useMemo(() => {
    return selectedPlan?.prices.find((p) => p.period === period);
  }, [selectedPlan, period]);

  const displayAmount = useMemo(() => {
    if (isFreeTier || !price) return 0;
    return price.amount;
  }, [isFreeTier, price]);

  const formatStorage = (gb: number) => {
    return `${gb.toLocaleString()} GB`;
  };

  const planItems = useMemo(
    () => [
      { value: "-1", label: `${formatStorage(FREE_TIER_GB)} (Free)` },
      ...availablePlans.map((plan, index) => ({
        value: String(index),
        label: formatStorage(plan.storageGB),
      })),
    ],
    [availablePlans],
  );

  return (
    <div className="flex flex-col gap-4">
      <FreePricingCalculator />

      <div className="flex w-full items-center gap-4">
        <hr className="w-full border-t" />
        <p className="text-muted-foreground text-sm">or</p>
        <hr className="w-full border-t" />
      </div>

      <div className="bg-card rounded-xl border p-4">
        <p className="text-lg font-semibold">CloudBlink</p>
        <p className="text-muted-foreground text-sm">
          Our optional cloud storage service
        </p>

        <Select
          value={String(planIndex)}
          onValueChange={(value) => setPlanIndex(Number(value))}
          items={planItems}
        >
          <SelectTrigger className="bg-secondary mt-5 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            {planItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!isFreeTier && (
          <Tabs
            value={period}
            onValueChange={(value) => setPeriod(value as BillingPeriod)}
            className="mt-3"
          >
            <TabsList className="w-full">
              <TabsTrigger value="MONTHLY">Monthly</TabsTrigger>
              <TabsTrigger value="YEARLY">
                Yearly
                <span className="bg-primary/10 text-primary ml-1 rounded px-1 py-0.5 text-[10px]">
                  -25%
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="mt-5 flex items-baseline gap-1">
          <span className="text-3xl font-bold">
            {displayAmount.toLocaleString(undefined, {
              style: "currency",
              currency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
          <span className="text-muted-foreground">
            {period === "YEARLY" ? "/year" : "/month"}
          </span>
        </div>
      </div>
    </div>
  );
}
