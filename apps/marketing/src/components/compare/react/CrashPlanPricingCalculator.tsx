import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

type BillingPeriod = "MONTHLY" | "1_YEAR" | "2_YEARS";

const prices: Record<BillingPeriod, { amount: number; label: string }> = {
  MONTHLY: { amount: 8, label: "/month" },
  "1_YEAR": { amount: 88, label: "/year" },
  "2_YEARS": { amount: 158, label: "/2 years" },
};

export default function CrashPlanPricingCalculator() {
  const [period, setPeriod] = useState<BillingPeriod>("1_YEAR");
  const [quantity, setQuantity] = useState(1);

  const { amount, label } = prices[period];
  const totalAmount = amount * quantity;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card rounded-xl border p-4">
        <p className="text-lg font-semibold">CrashPlan</p>
        <p className="text-muted-foreground text-sm">
          Endpoint backup for small businesses
        </p>

        <div className="mt-5">
          <label className="text-muted-foreground mb-1 block text-xs">
            Devices
          </label>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              type="button"
              size="icon-sm"
              variant="outline"
              disabled={quantity <= 1}
            >
              <MinusIcon className="size-4" />
            </Button>
            <Input
              className="bg-secondary w-16 text-center"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => {
                const val = Math.max(1, e.target.valueAsNumber || 1);
                setQuantity(val);
              }}
            />
            <Button
              onClick={() => setQuantity(quantity + 1)}
              type="button"
              size="icon-sm"
              variant="outline"
            >
              <PlusIcon className="size-4" />
            </Button>
          </div>
        </div>

        <Tabs
          value={period}
          onValueChange={(value) => setPeriod(value as BillingPeriod)}
          className="mt-3"
        >
          <TabsList className="w-full">
            <TabsTrigger value="MONTHLY">Monthly</TabsTrigger>
            <TabsTrigger value="1_YEAR">1 Year</TabsTrigger>
            <TabsTrigger value="2_YEARS">2 Years</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-5 flex items-baseline gap-1">
          <span className="text-3xl font-bold">
            {totalAmount.toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-muted-foreground">{label}</span>
        </div>
        {quantity > 1 && (
          <p className="text-muted-foreground mt-1 text-xs">
            {amount.toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
            })}{" "}
            × {quantity}
          </p>
        )}
      </div>
    </div>
  );
}
