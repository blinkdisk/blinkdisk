import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import { useState } from "react";

type PlanType = "basic" | "mini" | "personal";
type BillingPeriod = "monthly" | "yearly";

type StorageOption = {
  label: string;
  yearly: number;
  monthly?: number;
};

type Plan = {
  name: string;
  description: string;
  yearlyOnly: boolean;
  storageOptions: StorageOption[];
};

const plans: Record<PlanType, Plan> = {
  basic: {
    name: "Basic",
    description: "Free starter plan",
    yearlyOnly: true,
    storageOptions: [{ label: "10 GB", yearly: 0 }],
  },
  mini: {
    name: "IDrive Mini",
    description: "Affordable cloud backup",
    yearlyOnly: true,
    storageOptions: [
      { label: "100 GB", yearly: 2.95 },
      { label: "500 GB", yearly: 9.95 },
    ],
  },
  personal: {
    name: "IDrive Personal",
    description: "Full-featured personal backup",
    yearlyOnly: false,
    storageOptions: [
      { label: "5 TB", yearly: 99.5, monthly: 9.95 },
      { label: "10 TB", yearly: 149.5, monthly: 14.95 },
      { label: "20 TB", yearly: 249.5, monthly: 24.95 },
      { label: "50 TB", yearly: 499.5, monthly: 49.95 },
      { label: "100 TB", yearly: 999.5, monthly: 99.95 },
    ],
  },
};

export default function IDrivePricingCalculator() {
  const [planType, setPlanType] = useState<PlanType>("personal");
  const [storageIndex, setStorageIndex] = useState(0);
  const [period, setPeriod] = useState<BillingPeriod>("yearly");

  const plan = plans[planType];
  const storage = plan.storageOptions[storageIndex] ?? plan.storageOptions[0];

  const effectivePeriod = plan.yearlyOnly ? "yearly" : period;
  const price =
    effectivePeriod === "monthly" && storage?.monthly
      ? storage.monthly
      : storage?.yearly ?? 0;

  const handlePlanChange = (value: PlanType) => {
    setPlanType(value);
    setStorageIndex(0);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-card p-4">
        <p className="text-lg font-semibold">{plan.name}</p>
        <p className="text-sm text-muted-foreground">{plan.description}</p>

        <Select value={planType} onValueChange={handlePlanChange}>
          <SelectTrigger className="mt-5 bg-secondary text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="mini">IDrive Mini</SelectItem>
            <SelectItem value="personal">IDrive Personal</SelectItem>
          </SelectContent>
        </Select>

        {plan.storageOptions.length > 1 && (
          <Select
            value={storageIndex.toString()}
            onValueChange={(value) => setStorageIndex(parseInt(value))}
          >
            <SelectTrigger className="mt-3 bg-secondary text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {plan.storageOptions.map((option, index) => (
                <SelectItem key={option.label} value={index.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {!plan.yearlyOnly && (
          <Tabs
            value={period}
            onValueChange={(value) => setPeriod(value as BillingPeriod)}
            className="mt-3"
          >
            <TabsList className="w-full">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="mt-5 flex items-baseline gap-1">
          {price === 0 ? (
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
              <span className="text-muted-foreground">
                /{effectivePeriod === "monthly" ? "month" : "year"}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
