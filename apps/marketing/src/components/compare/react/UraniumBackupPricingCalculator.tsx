import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@blinkdisk/ui/select";
import { useMemo, useState } from "react";

type LicenseType = "free" | "base" | "pro" | "gold";

type License = {
  name: string;
  description: string;
  price: number;
  from?: boolean;
};

const licenses: Record<LicenseType, License> = {
  free: {
    name: "Free",
    description: "A complete solution for files and folders backup",
    price: 0,
  },
  base: {
    name: "Base",
    description:
      "All Free features plus disk image (Drive Image) backup and much more",
    price: 80,
  },
  pro: {
    name: "Pro",
    description:
      "Powerful data protection with Tape, databases and VMs backup",
    price: 150,
    from: true,
  },
  gold: {
    name: "Gold",
    description:
      "The all-in-one solution to ensure maximum protection for all your workloads",
    price: 290,
  },
};

export default function UraniumBackupPricingCalculator() {
  const [licenseType, setLicenseType] = useState<LicenseType>("base");

  const license = licenses[licenseType];

  const licenseItems = useMemo(
    () => [
      { value: "free", label: "Free" },
      { value: "base", label: "Base" },
      { value: "pro", label: "Pro" },
      { value: "gold", label: "Gold" },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card rounded-xl border p-4">
        <p className="text-lg font-semibold">Uranium Backup</p>
        <p className="text-muted-foreground text-sm">{license.description}</p>

        <Select
          value={licenseType}
          onValueChange={(to) => to && setLicenseType(to as LicenseType)}
          items={licenseItems}
        >
          <SelectTrigger className="bg-secondary mt-5 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {licenseItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-5 flex items-baseline gap-1">
          {license.from && (
            <span className="text-muted-foreground text-sm">from</span>
          )}
          <span className="text-3xl font-bold">
            {license.price.toLocaleString(undefined, {
              style: "currency",
              currency: "EUR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
          <span className="text-muted-foreground">
            {licenseType === "free" ? "" : " one-time"}
          </span>
        </div>
      </div>
    </div>
  );
}
