import { Button } from "@blinkdisk/ui/button";
import { Input } from "@blinkdisk/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@blinkdisk/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@blinkdisk/ui/tabs";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";

type LicenseType = "personal" | "commercial" | "cli";
type YearType = "first" | "subsequent";

type License = {
  name: string;
  description: string;
  supportsYearToggle: boolean;
  calculate: (computers: number, year: YearType) => number;
};

const licenses: Record<LicenseType, License> = {
  personal: {
    name: "Personal License",
    description: "Home computers, backing up personal files only",
    supportsYearToggle: true,
    calculate: (computers, year) => {
      if (computers < 1) return 0;
      if (year === "first") return 20 + (computers - 1) * 10;
      return 5 + (computers - 1) * 2;
    },
  },
  commercial: {
    name: "Commercial License",
    description: "No usage restrictions, any files on any computer",
    supportsYearToggle: false,
    calculate: (computers) => 50 * computers,
  },
  cli: {
    name: "CLI License",
    description: "Run the command-line version without restrictions",
    supportsYearToggle: false,
    calculate: (computers) => 50 * computers,
  },
};

export default function DuplicacyPricingCalculator() {
  const [licenseType, setLicenseType] = useState<LicenseType>("personal");
  const [yearType, setYearType] = useState<YearType>("first");
  const [computers, setComputers] = useState(1);

  const license = licenses[licenseType];
  const total = license.calculate(computers, yearType);

  const licenseItems = useMemo(
    () => [
      { value: "personal", label: "Personal License" },
      { value: "commercial", label: "Commercial License" },
      { value: "cli", label: "CLI License" },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card rounded-xl border p-4">
        <p className="text-lg font-semibold">{license.name}</p>
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

        <div className="mt-3">
          <label className="text-muted-foreground mb-1 block text-xs">
            Computers
          </label>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setComputers(Math.max(1, computers - 1))}
              type="button"
              size="icon-sm"
              variant="secondary"
              disabled={computers <= 1}
            >
              <MinusIcon className="size-4" />
            </Button>
            <Input
              className="bg-secondary w-16 text-center"
              type="number"
              min={1}
              value={computers}
              onChange={(e) => {
                const val = Math.max(1, e.target.valueAsNumber || 1);
                setComputers(val);
              }}
            />
            <Button
              onClick={() => setComputers(computers + 1)}
              type="button"
              size="icon-sm"
              variant="secondary"
            >
              <PlusIcon className="size-4" />
            </Button>
          </div>
        </div>

        {license.supportsYearToggle && (
          <Tabs
            value={yearType}
            onValueChange={(value) => setYearType(value as YearType)}
            className="mt-3"
          >
            <TabsList className="w-full">
              <TabsTrigger value="first">First year</TabsTrigger>
              <TabsTrigger value="subsequent">Subsequent years</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="mt-5 flex items-baseline gap-1">
          <span className="text-3xl font-bold">
            {total.toLocaleString(undefined, {
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
