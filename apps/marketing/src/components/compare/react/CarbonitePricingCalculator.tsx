import { Button } from "@ui/button";
import { Input } from "@ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

type PlanType = "basic" | "plus" | "prime";
type BillingPeriod = "1_YEAR" | "2_YEARS" | "3_YEARS";

const plans: Record<
  PlanType,
  {
    name: string;
    description: string;
    quantityLabel: string;
    prices: Record<BillingPeriod, { amount: number; label: string }>;
  }
> = {
  basic: {
    name: "Basic",
    description: "Cloud backup for your files",
    quantityLabel: "Computers",
    prices: {
      "1_YEAR": { amount: 95.99, label: "/year" },
      "2_YEARS": { amount: 159.59, label: "/2 years" },
      "3_YEARS": { amount: 237.58, label: "/3 years" },
    },
  },
  plus: {
    name: "Plus",
    description: "Includes external hard drive backup",
    quantityLabel: "Computers / Hard Drives",
    prices: {
      "1_YEAR": { amount: 131.99, label: "/year" },
      "2_YEARS": { amount: 200.43, label: "/2 years" },
      "3_YEARS": { amount: 308.67, label: "/3 years" },
    },
  },
  prime: {
    name: "Prime",
    description: "Full protection with courier recovery",
    quantityLabel: "Computers / Hard Drives",
    prices: {
      "1_YEAR": { amount: 161.99, label: "/year" },
      "2_YEARS": { amount: 323.98, label: "/2 years" },
      "3_YEARS": { amount: 485.97, label: "/3 years" },
    },
  },
};

export default function CarbonitePricingCalculator() {
  const [planType, setPlanType] = useState<PlanType>("basic");
  const [period, setPeriod] = useState<BillingPeriod>("1_YEAR");
  const [quantity, setQuantity] = useState(1);

  const plan = plans[planType];
  const { amount, label } = plan.prices[period];

  const totalAmount = amount * quantity;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card rounded-xl border p-4">
        <p className="text-lg font-semibold">Carbonite</p>
        <p className="text-muted-foreground text-sm">{plan.description}</p>

        <Select
          value={planType}
          onValueChange={(value) => setPlanType(value as PlanType)}
        >
          <SelectTrigger className="bg-secondary mt-5 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="plus">Plus</SelectItem>
            <SelectItem value="prime">Prime</SelectItem>
          </SelectContent>
        </Select>

        <div className="mt-3">
          <label className="text-muted-foreground mb-1 block text-xs">
            {plan.quantityLabel}
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
            <TabsTrigger value="1_YEAR">1 Year</TabsTrigger>
            <TabsTrigger value="2_YEARS">2 Years</TabsTrigger>
            <TabsTrigger value="3_YEARS">3 Years</TabsTrigger>
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
