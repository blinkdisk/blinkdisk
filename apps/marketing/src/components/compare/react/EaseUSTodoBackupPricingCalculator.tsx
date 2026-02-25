import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import { useState } from "react";

type PlanType = "home-mac" | "home-windows" | "workstation";
type BillingPeriod = "1_YEAR" | "2_YEARS" | "LIFETIME";

type PlanConfig = {
  name: string;
  description: string;
  prices: Record<BillingPeriod, number> | { fixed: number };
};

const plans: Record<PlanType, PlanConfig> = {
  "home-mac": {
    name: "Home for Mac",
    description: "Complete backup solution for macOS",
    prices: { fixed: 36.95 },
  },
  "home-windows": {
    name: "Home for Windows",
    description: "Complete backup solution for Windows",
    prices: {
      "1_YEAR": 29.95,
      "2_YEARS": 39.95,
      LIFETIME: 59.0,
    },
  },
  workstation: {
    name: "Workstation",
    description: "Professional backup for power users",
    prices: {
      "1_YEAR": 39.0,
      "2_YEARS": 49.0,
      LIFETIME: 79.0,
    },
  },
};

const periodLabels: Record<BillingPeriod, string> = {
  "1_YEAR": "/year",
  "2_YEARS": "/2 years",
  LIFETIME: " one-time",
};

export default function EaseUSTodoBackupPricingCalculator() {
  const [planType, setPlanType] = useState<PlanType>("home-windows");
  const [period, setPeriod] = useState<BillingPeriod>("1_YEAR");

  const plan = plans[planType];
  const hasVariablePricing = "1_YEAR" in plan.prices;
  const price = hasVariablePricing
    ? (plan.prices as Record<BillingPeriod, number>)[period]
    : (plan.prices as { fixed: number }).fixed;
  const label = hasVariablePricing ? periodLabels[period] : " one-time";

  const handlePlanChange = (value: PlanType) => {
    setPlanType(value);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card rounded-xl border p-4">
        <p className="text-lg font-semibold">EaseUS Todo Backup</p>
        <p className="text-muted-foreground text-sm">{plan.description}</p>

        <Select value={planType} onValueChange={handlePlanChange}>
          <SelectTrigger className="bg-secondary mt-5 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="home-mac">Home for Mac</SelectItem>
            <SelectItem value="home-windows">Home for Windows</SelectItem>
            <SelectItem value="workstation">Workstation</SelectItem>
          </SelectContent>
        </Select>

        {hasVariablePricing && (
          <Tabs
            value={period}
            onValueChange={(value) => setPeriod(value as BillingPeriod)}
            className="mt-3"
          >
            <TabsList className="w-full">
              <TabsTrigger value="1_YEAR">1 Year</TabsTrigger>
              <TabsTrigger value="2_YEARS">2 Years</TabsTrigger>
              <TabsTrigger value="LIFETIME">Lifetime</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="mt-5 flex items-baseline gap-1">
          <span className="text-3xl font-bold">
            {price.toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
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
