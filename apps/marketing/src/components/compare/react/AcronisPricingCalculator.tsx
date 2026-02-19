import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { useState } from "react";

type PlanType = "essentials" | "advanced" | "premium";

type StorageOption = {
  label: string;
  price: number;
};

type Plan = {
  name: string;
  description: string;
  storageOptions: StorageOption[];
};

const plans: Record<PlanType, Plan> = {
  essentials: {
    name: "Essentials",
    description: "Local backup, cloning & ransomware protection",
    storageOptions: [{ label: "No cloud storage", price: 49.99 }],
  },
  advanced: {
    name: "Advanced",
    description: "Local & cloud backup with antimalware protection",
    storageOptions: [
      { label: "50 GB", price: 57.99 },
      { label: "250 GB", price: 72.99 },
      { label: "500 GB", price: 89.99 },
    ],
  },
  premium: {
    name: "Premium",
    description: "Full protection with blockchain notarization",
    storageOptions: [
      { label: "1 TB", price: 124.99 },
      { label: "2 TB", price: 164.99 },
      { label: "3 TB", price: 204.99 },
      { label: "4 TB", price: 244.99 },
      { label: "5 TB", price: 284.99 },
      { label: "10 TB", price: 559.99 },
    ],
  },
};

export default function AcronisTrueImagePricingCalculator() {
  const [planType, setPlanType] = useState<PlanType>("advanced");
  const [storageIndex, setStorageIndex] = useState(0);

  const plan = plans[planType];
  const storage = plan.storageOptions[storageIndex] ?? plan.storageOptions[0];

  const handlePlanChange = (value: PlanType) => {
    setPlanType(value);
    setStorageIndex(0);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-card p-4">
        <p className="text-lg font-semibold">Acronis True Image</p>
        <p className="text-sm text-muted-foreground">{plan.description}</p>

        <Select value={planType} onValueChange={handlePlanChange}>
          <SelectTrigger className="mt-5 bg-secondary text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="essentials">Essentials</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
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

        <div className="mt-5 flex items-baseline gap-1">
          <span className="text-3xl font-bold">
            {storage?.price.toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-muted-foreground">/year</span>
        </div>
      </div>
    </div>
  );
}
