import {
  COMPARISON_FEATURE_LABELS,
  COMPARISON_GENERAL_LABELS,
  COMPARISON_INTERFACE_LABELS,
  COMPARISON_LEVEL_LABELS,
  COMPARISON_PLATFORM_LABELS,
  COMPARISON_PRIVACY_LABELS,
  COMPARISON_STORAGE_LABELS,
  COMPARISON_STRATEGY_LABELS,
} from "@blinkdisk/constants/comparison";
import { ALL_COUNTRIES } from "@blinkdisk/constants/countries";
import {
  AppWindowIcon,
  HardDriveIcon,
  InfoIcon,
  LayersIcon,
  ListChecksIcon,
  MonitorIcon,
  RotateCcwIcon,
  ShieldIcon,
} from "lucide-react";

import type {
  CountryOption,
  EuropeOption,
  FilterCategory,
  PricingOption,
  SectionConfig,
} from "./types";

export const FILTER_CATEGORIES: FilterCategory[] = [
  "general",
  "level",
  "strategies",
  "features",
  "interface",
  "privacy",
  "platforms",
  "storages",
];

export const SECTIONS: SectionConfig[] = [
  {
    id: "general",
    title: "General",
    icon: InfoIcon,
    labels: COMPARISON_GENERAL_LABELS,
  },
  {
    id: "level",
    title: "Level",
    icon: LayersIcon,
    labels: COMPARISON_LEVEL_LABELS,
  },
  {
    id: "strategies",
    title: "Backup Strategies",
    icon: RotateCcwIcon,
    labels: COMPARISON_STRATEGY_LABELS,
  },
  {
    id: "features",
    title: "Features",
    icon: ListChecksIcon,
    labels: COMPARISON_FEATURE_LABELS,
  },
  {
    id: "interface",
    title: "Interface",
    icon: AppWindowIcon,
    labels: COMPARISON_INTERFACE_LABELS,
  },
  {
    id: "privacy",
    title: "Privacy & Security",
    icon: ShieldIcon,
    labels: COMPARISON_PRIVACY_LABELS,
  },
  {
    id: "platforms",
    title: "Platforms",
    icon: MonitorIcon,
    labels: COMPARISON_PLATFORM_LABELS,
  },
  {
    id: "storages",
    title: "Storage",
    icon: HardDriveIcon,
    labels: COMPARISON_STORAGE_LABELS,
  },
];

// Only filter on "supported"-style general fields; release year + country are text.
export const GENERAL_FILTER_KEYS = new Set(["openSource"]);

export const PRICING_OPTIONS: PricingOption[] = [
  { value: "free", label: "Free", description: "All features free" },
  { value: "freemium", label: "Freemium", description: "Has paid features" },
  { value: "paid", label: "Paid", description: "Requires payment" },
];

export const EUROPE_OPTION: EuropeOption = {
  code: "EUROPE",
  name: "Europe",
  emoji: "🇪🇺",
  europe: true,
};

export const COUNTRY_OPTIONS: CountryOption[] = Object.entries(ALL_COUNTRIES)
  .map(([code, country]) => ({
    code: code as CountryOption["code"],
    emoji: country.emoji,
    name: country.name,
    europe: "europe" in country ? country.europe : undefined,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
