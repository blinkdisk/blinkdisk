import { Input } from "@blinkdisk/ui/input";

import type { ReleaseYearRange } from "./types";

type ReleaseYearRangeFieldsProps = {
  value: ReleaseYearRange;
  minAvailableReleaseYear?: number;
  maxAvailableReleaseYear?: number;
  onChange: (bound: keyof ReleaseYearRange, value: string) => void;
};

export function ReleaseYearRangeFields({
  value,
  minAvailableReleaseYear,
  maxAvailableReleaseYear,
  onChange,
}: ReleaseYearRangeFieldsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <h4 className="text-foreground text-sm font-medium">Release Year</h4>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          min={minAvailableReleaseYear}
          max={maxAvailableReleaseYear}
          placeholder={minAvailableReleaseYear?.toString()}
          value={value.min}
          aria-label="Minimum release year"
          onChange={(event) => onChange("min", event.target.value)}
        />
        <span className="text-muted-foreground text-sm">-</span>
        <Input
          type="number"
          inputMode="numeric"
          min={minAvailableReleaseYear}
          max={maxAvailableReleaseYear}
          placeholder={maxAvailableReleaseYear?.toString()}
          value={value.max}
          aria-label="Maximum release year"
          onChange={(event) => onChange("max", event.target.value)}
        />
      </div>
    </div>
  );
}
