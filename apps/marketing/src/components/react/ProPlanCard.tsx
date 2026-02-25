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

  const formatStorage = (gb: number) => {
    return `${gb.toLocaleString()} GB`;
  };

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
          <Select
            value={String(planIndex)}
            onValueChange={(value) => setPlanIndex(Number(value))}
          >
            <SelectTrigger className="bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              {availablePlans.map((plan, index) => (
                <SelectItem key={plan.id} value={String(index)}>
                  {formatStorage(plan.storageGB)}
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
