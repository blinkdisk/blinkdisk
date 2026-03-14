import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { useMemo, useState } from "react";

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

  const planItems = useMemo(
    () => [
      { value: "essentials", label: "Essentials" },
      { value: "advanced", label: "Advanced" },
      { value: "premium", label: "Premium" },
    ],
    [],
  );

  const storageItems = useMemo(
    () =>
      plan.storageOptions.map((option, index) => ({
        value: index.toString(),
        label: option.label,
      })),
    [plan.storageOptions],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card rounded-xl border p-4">
        <p className="text-lg font-semibold">Acronis True Image</p>
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

        {storageItems.length > 1 && (
          <Select
            value={storageIndex.toString()}
            onValueChange={(value) => value && setStorageIndex(parseInt(value))}
            items={storageItems}
          >
            <SelectTrigger className="bg-secondary mt-3 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {storageItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
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
