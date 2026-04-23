import type { LabelConfig } from "@blinkdisk/constants/comparison";
import type { Country, CountryCode } from "@blinkdisk/constants/countries";
import type { NormalizedBackupTool } from "@blinkdisk/utils/tools";
import type { SelectedKey } from "@marketing/components/finder/react/FinderResultCard";
import type { LucideIcon } from "lucide-react";

export type FilterCategory = SelectedKey["category"];
export type FilterGroupId = "pricing" | FilterCategory;

export type SectionConfig = {
  id: FilterCategory;
  title: string;
  icon: LucideIcon;
  labels: Record<string, LabelConfig>;
};

export type PricingOption = {
  value: NormalizedBackupTool["pricing"];
  label: string;
  description: string;
};

export type CountryOption = Country & { code: CountryCode };

export type EuropeOption = {
  code: "EUROPE";
  name: "Europe";
  emoji: "🇪🇺";
  europe: true;
};

export type OriginOption = CountryOption | EuropeOption;
export type OriginFilterValue = CountryCode | EuropeOption["code"];

export type ReleaseYearRange = {
  min: string;
  max: string;
};

export type Filters = {
  pricing: Set<NormalizedBackupTool["pricing"]>;
  byCategory: Record<FilterCategory, Set<string>>;
  releaseYear: ReleaseYearRange;
  originCountries: Set<OriginFilterValue>;
};
