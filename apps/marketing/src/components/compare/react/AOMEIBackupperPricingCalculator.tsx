import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@blinkdisk/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@blinkdisk/ui/tabs";
import { useMemo, useState } from "react";

type PlanType =
  | "standard"
  | "professional"
  | "workstation"
  | "server"
  | "technician"
  | "technician-plus";
type BillingPeriod = "1_YEAR" | "LIFETIME";

type PlanConfig = {
  name: string;
  description: string;
  prices: Record<BillingPeriod, number> | { fixed: number };
};

const plans: Record<PlanType, PlanConfig> = {
  standard: {
    name: "Standard",
    description: "Free edition for home users",
    prices: { fixed: 0 },
  },
  professional: {
    name: "Professional",
    description: "Advanced backup for home PCs",
    prices: {
      "1_YEAR": 39.95,
      LIFETIME: 69.95,
    },
  },
  workstation: {
    name: "Workstation",
    description: "Backup for commercial workstations",
    prices: {
      "1_YEAR": 49.95,
      LIFETIME: 79.95,
    },
  },
  server: {
    name: "Server",
    description: "Backup for Windows Server machines",
    prices: {
      "1_YEAR": 149.0,
      LIFETIME: 249.0,
    },
  },
  technician: {
    name: "Technician",
    description: "Unlimited billable tech service on client PCs",
    prices: {
      "1_YEAR": 499.0,
      LIFETIME: 799.0,
    },
  },
  "technician-plus": {
    name: "Technician Plus",
    description: "Unlimited billable tech service on PCs and servers",
    prices: {
      "1_YEAR": 699.0,
      LIFETIME: 999.0,
    },
  },
};

const periodLabels: Record<BillingPeriod, string> = {
  "1_YEAR": "/year",
  LIFETIME: " one-time",
};

export default function AOMEIBackupperPricingCalculator() {
  const [planType, setPlanType] = useState<PlanType>("professional");
  const [period, setPeriod] = useState<BillingPeriod>("1_YEAR");

  const plan = plans[planType];
  const hasVariablePricing = "1_YEAR" in plan.prices;
  const price = hasVariablePricing
    ? (plan.prices as Record<BillingPeriod, number>)[period]
    : (plan.prices as { fixed: number }).fixed;
  const isFree = !hasVariablePricing && price === 0;
  const label = hasVariablePricing ? periodLabels[period] : "";

  const handlePlanChange = (value: PlanType) => {
    setPlanType(value);
  };

  const planItems = useMemo(
    () => [
      { value: "standard", label: "Standard (Free)" },
      { value: "professional", label: "Professional" },
      { value: "workstation", label: "Workstation" },
      { value: "server", label: "Server" },
      { value: "technician", label: "Technician" },
      { value: "technician-plus", label: "Technician Plus" },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card rounded-xl border p-4">
        <p className="text-lg font-semibold">AOMEI Backupper</p>
        <p className="text-muted-foreground text-sm">{plan.description}</p>

        <Select
          value={planType}
          onValueChange={(to) => to && handlePlanChange(to)}
          items={planItems}
        >
          <SelectTrigger className="bg-secondary mt-5 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {planItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
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
              <TabsTrigger value="LIFETIME">Lifetime</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="mt-5 flex items-baseline gap-1">
          {isFree ? (
            <span className="text-3xl font-bold">Free</span>
          ) : (
            <>
              <span className="text-3xl font-bold">
                {price.toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-muted-foreground">{label}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
