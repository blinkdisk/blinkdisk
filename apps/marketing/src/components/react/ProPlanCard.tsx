import type { BillingPeriod } from "@config/plans";
import { plans } from "@config/plans";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { CheckIcon } from "lucide-react";
import { useMemo, useState } from "react";

const currency = "USD";

export default function ProPlanCard() {
  const [period, setPeriod] = useState<BillingPeriod>("YEARLY");
  const [planIndex, setPlanIndex] = useState(0);

  const availablePlans = useMemo(() => plans, []);
  const selectedPlan = availablePlans[planIndex];

  const price = useMemo(() => {
    return selectedPlan?.prices.find((p) => p.period === period);
  }, [selectedPlan, period]);

  const monthlyAmount = useMemo(() => {
    if (!price) return 0;
    return period === "YEARLY" ? price.amount / 12 : price.amount;
  }, [price, period]);

  const originalMonthlyAmount = useMemo(() => {
    if (period !== "YEARLY") return null;
    const monthlyPrice = selectedPlan?.prices.find((p) => p.period === "MONTHLY");
    return monthlyPrice?.amount ?? null;
  }, [selectedPlan, period]);

  const formatStorage = (gb: number) => {
    if (gb >= 1000) {
      return `${gb / 1000} TB`;
    }
    return `${gb} GB`;
  };

  return (
    <div className="bg-card relative flex flex-col rounded-2xl border-2 border-primary/50 p-8">
      <div className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium">
        Most Popular
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Pro</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          For power users and professionals
        </p>
      </div>

      <div className="mb-6">
        <div className="bg-secondary mb-4 flex rounded-lg p-1">
          <button
            onClick={() => setPeriod("MONTHLY")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              period === "MONTHLY"
                ? "bg-background shadow"
                : "hover:bg-background/50"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod("YEARLY")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              period === "YEARLY"
                ? "bg-background shadow"
                : "hover:bg-background/50"
            }`}
          >
            Yearly
            <span className="bg-primary/10 text-primary ml-1.5 rounded px-1.5 py-0.5 text-xs">
              -25%
            </span>
          </button>
        </div>

        <div className="mb-4">
          <label className="text-muted-foreground mb-2 block text-xs font-medium uppercase tracking-wide">
            Storage
          </label>
          <Select
            value={String(planIndex)}
            onValueChange={(value) => setPlanIndex(Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availablePlans.map((plan, index) => (
                <SelectItem key={plan.id} value={String(index)}>
                  {formatStorage(plan.storageGB)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {originalMonthlyAmount && (
          <p className="text-muted-foreground text-sm line-through">
            {originalMonthlyAmount.toLocaleString(undefined, {
              style: "currency",
              currency,
              minimumFractionDigits: 0,
            })}
            /month
          </p>
        )}
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
          <span>
            <strong>{formatStorage(selectedPlan?.storageGB ?? 0)}</strong> cloud
            storage
          </span>
        </li>
        <li className="flex items-center gap-2">
          <CheckIcon className="text-primary size-4 shrink-0" />
          <span>End-to-end encryption</span>
        </li>
        <li className="flex items-center gap-2">
          <CheckIcon className="text-primary size-4 shrink-0" />
          <span>All desktop features</span>
        </li>
        <li className="flex items-center gap-2">
          <CheckIcon className="text-primary size-4 shrink-0" />
          <span>Priority support</span>
        </li>
        <li className="flex items-center gap-2">
          <CheckIcon className="text-primary size-4 shrink-0" />
          <span>Scale storage anytime</span>
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
