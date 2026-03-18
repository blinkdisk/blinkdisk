import type { BillingPeriod } from "@blinkdisk/constants/plans";
import { SUBSCRIPTION_PLANS } from "@blinkdisk/constants/plans";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@blinkdisk/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@blinkdisk/ui/tabs";
import { CheckIcon } from "lucide-react";
import { useMemo, useState } from "react";

const currency = "USD";

export default function ProPlanCard() {
  const [period, setPeriod] = useState<BillingPeriod>("YEARLY");
  const [planIndex, setPlanIndex] = useState(0);

  const availablePlans = useMemo(() => SUBSCRIPTION_PLANS, []);
  const selectedPlan = availablePlans[planIndex];

  const price = useMemo(() => {
    return selectedPlan?.prices.find((p) => p.period === period);
  }, [selectedPlan, period]);

  const monthlyAmount = useMemo(() => {
    if (!price) return 0;
    return period === "YEARLY" ? price.amount / 12 : price.amount;
  }, [price, period]);

  const formatStorage = (gb: number) => {
    return `${gb.toLocaleString()} GB`;
  };

  const planItems = useMemo(
    () =>
      availablePlans.map((plan, index) => ({
        value: String(index),
        label: formatStorage(plan.storageGB),
      })),
    [availablePlans],
  );

  return (
    <div className="bg-card border-primary/50 relative flex flex-col rounded-2xl border-2 p-8">
      <div className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium">
        Most Popular
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Pro</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          For anyone who needs more storage
        </p>
      </div>

      <div className="mb-6">
        <Tabs
          value={period}
          onValueChange={(value) => setPeriod(value as BillingPeriod)}
          className="mb-4"
        >
          <TabsList className="w-full">
            <TabsTrigger value="MONTHLY">Monthly</TabsTrigger>
            <TabsTrigger value="YEARLY">
              Yearly
              <span className="bg-primary/10 text-primary ml-1.5 rounded px-1.5 py-0.5 text-xs">
                -25%
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mb-4">
          <Select
            value={String(planIndex)}
            onValueChange={(value) => setPlanIndex(Number(value))}
            items={planItems}
          >
            <SelectTrigger className="bg-secondary">
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
        </div>

        <div className="flex items-baseline">
          <span className="text-4xl font-bold">
            {monthlyAmount.toLocaleString(undefined, {
              style: "currency",
              currency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
          <span className="text-muted-foreground ml-1">/month</span>
        </div>
      </div>

      <ul className="mb-8 flex-1 space-y-3 text-sm">
        <li className="flex items-center gap-2">
          <CheckIcon className="text-primary size-4 shrink-0" />
          <span>Everything in Free</span>
        </li>
        <li className="flex items-center gap-2">
          <CheckIcon className="text-primary size-4 shrink-0" />
          <span>
            <strong>{formatStorage(selectedPlan?.storageGB ?? 0)}</strong> cloud
            storage
          </span>
        </li>
      </ul>

      <a
        href="/download"
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition-colors"
      >
        Get Started
      </a>
    </div>
  );
}
