import { Input } from "@blinkdisk/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@blinkdisk/ui/tabs";
import { useMemo, useState } from "react";

type Tier = "FREE" | "PRO" | "ENTERPRISE";

const PRO_PRICE_PER_DEVICE = 5;
const ENTERPRISE_MIN_PRICE = 500;

function formatCurrency(amount: number) {
  return amount.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function DuplicatiPricingCalculator() {
  const [tier, setTier] = useState<Tier>("PRO");
  const [devices, setDevices] = useState(5);

  const { priceLabel, priceSuffix } = useMemo(() => {
    if (tier === "FREE") {
      return { priceLabel: formatCurrency(0), priceSuffix: "/month" };
    }

    if (tier === "PRO") {
      const total = Math.max(1, devices) * PRO_PRICE_PER_DEVICE;
      return { priceLabel: formatCurrency(total), priceSuffix: "/month" };
    }

    return {
      priceLabel: `${formatCurrency(ENTERPRISE_MIN_PRICE)}+`,
      priceSuffix: "/month",
    };
  }, [tier, devices]);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card rounded-xl border p-4">
        <Tabs value={tier} onValueChange={(value) => setTier(value as Tier)}>
          <TabsList className="w-full">
            <TabsTrigger value="FREE">Free</TabsTrigger>
            <TabsTrigger value="PRO">Pro</TabsTrigger>
            <TabsTrigger value="ENTERPRISE">Enterprise</TabsTrigger>
          </TabsList>
        </Tabs>

        {tier === "PRO" && (
          <div className="mt-4 flex flex-col gap-2">
            <label
              htmlFor="duplicati-pricing-devices"
              className="text-muted-foreground text-xs font-medium"
            >
              Devices
            </label>
            <Input
              id="duplicati-pricing-devices"
              type="number"
              min={1}
              value={devices}
              onChange={(event) => {
                const next = Number(event.target.value);
                setDevices(Number.isFinite(next) && next > 0 ? next : 1);
              }}
              className="bg-secondary"
            />
            <p className="text-muted-foreground text-xs">
              {formatCurrency(PRO_PRICE_PER_DEVICE)} per device/month
            </p>
          </div>
        )}

        <div className="mt-5 flex items-baseline gap-1">
          <span className="text-3xl font-bold">{priceLabel}</span>
          <span className="text-muted-foreground">{priceSuffix}</span>
        </div>
      </div>
    </div>
  );
}
