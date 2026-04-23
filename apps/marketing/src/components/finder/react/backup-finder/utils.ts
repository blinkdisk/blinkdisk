import {
  ALL_COUNTRIES,
  type CountryCode,
} from "@blinkdisk/constants/countries";
import {
  type NormalizedBackupTool,
  type NormalizedCellValue,
} from "@blinkdisk/utils/tools";

import {
  EUROPE_OPTION,
  FILTER_CATEGORIES,
  GENERAL_FILTER_KEYS,
  SECTIONS,
} from "./constants";
import type {
  FilterCategory,
  FilterGroupId,
  Filters,
  OriginFilterValue,
  ReleaseYearRange,
} from "./types";

function createCategoryFilters(): Filters["byCategory"] {
  return {
    general: new Set(),
    level: new Set(),
    strategies: new Set(),
    features: new Set(),
    interface: new Set(),
    privacy: new Set(),
    platforms: new Set(),
    storages: new Set(),
  };
}

export function emptyFilters(): Filters {
  return {
    pricing: new Set(),
    byCategory: createCategoryFilters(),
    releaseYear: { min: "", max: "" },
    originCountries: new Set(),
  };
}

function cellMatches(cell: NormalizedCellValue): {
  matches: boolean;
  partial: boolean;
} {
  if (cell.value === true) return { matches: true, partial: false };
  if (cell.value === "partial") return { matches: true, partial: true };
  return { matches: false, partial: false };
}

function parseReleaseYearValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && /^\d{1,4}$/.test(value)) {
    return Number.parseInt(value, 10);
  }
  return null;
}

export function getToolReleaseYear(tool: NormalizedBackupTool): number | null {
  return parseReleaseYearValue(tool.general.releaseYear.value);
}

export function getToolOriginCountry(
  tool: NormalizedBackupTool,
): CountryCode | null {
  const value = tool.general.originCountry.value;
  if (typeof value !== "string") return null;
  if (!(value in ALL_COUNTRIES)) return null;
  return value as CountryCode;
}

function isEuropeanCountry(code: CountryCode | null): boolean {
  if (!code) return false;
  const country = ALL_COUNTRIES[code];
  return !!(country && "europe" in country && country.europe);
}

function getActiveReleaseYearBounds(range: ReleaseYearRange) {
  const min = parseReleaseYearValue(range.min);
  const max = parseReleaseYearValue(range.max);
  if (min !== null && max !== null && min > max) {
    return { min: max, max: min };
  }
  return { min, max };
}

export function toolMatchesFilters(
  tool: NormalizedBackupTool,
  filters: Filters,
): { matches: boolean; fullCount: number; partialCount: number } {
  if (filters.pricing.size > 0 && !filters.pricing.has(tool.pricing)) {
    return { matches: false, fullCount: 0, partialCount: 0 };
  }

  const { min: minReleaseYear, max: maxReleaseYear } =
    getActiveReleaseYearBounds(filters.releaseYear);

  if (minReleaseYear !== null || maxReleaseYear !== null) {
    const releaseYear = getToolReleaseYear(tool);
    if (
      releaseYear === null ||
      (minReleaseYear !== null && releaseYear < minReleaseYear) ||
      (maxReleaseYear !== null && releaseYear > maxReleaseYear)
    ) {
      return { matches: false, fullCount: 0, partialCount: 0 };
    }
  }

  if (filters.originCountries.size > 0) {
    const originCountry = getToolOriginCountry(tool);
    const matchesCountry =
      originCountry !== null && filters.originCountries.has(originCountry);
    const matchesEurope =
      filters.originCountries.has(EUROPE_OPTION.code) &&
      isEuropeanCountry(originCountry);

    if (!matchesCountry && !matchesEurope) {
      return { matches: false, fullCount: 0, partialCount: 0 };
    }
  }

  let fullCount = 0;
  let partialCount = 0;

  for (const category of FILTER_CATEGORIES) {
    const selected = filters.byCategory[category];
    if (selected.size === 0) continue;

    for (const key of selected) {
      const cell = (
        (tool[category] ?? {}) as Record<string, NormalizedCellValue>
      )[key] ?? {
        value: null,
        note: null,
      };
      const { matches, partial } = cellMatches(cell);

      if (!matches) {
        return { matches: false, fullCount: 0, partialCount: 0 };
      }

      if (partial) partialCount += 1;
      else fullCount += 1;
    }
  }

  return { matches: true, fullCount, partialCount };
}

export function countActive(filters: Filters): number {
  let count = filters.pricing.size;

  for (const category of Object.values(filters.byCategory)) {
    count += category.size;
  }

  if (filters.releaseYear.min || filters.releaseYear.max) {
    count += 1;
  }

  if (filters.originCountries.size > 0) {
    count += 1;
  }

  return count;
}

export function buildCompareHref(slugs: string[]) {
  return `/compare/${slugs.join("-vs-")}`;
}

export function getCategoryActiveCount(
  filters: Filters,
  category: FilterCategory,
): number {
  if (category === "general") {
    return (
      filters.byCategory.general.size +
      (filters.releaseYear.min || filters.releaseYear.max ? 1 : 0) +
      (filters.originCountries.size > 0 ? 1 : 0)
    );
  }

  return filters.byCategory[category].size;
}

export function getOpenGroupsFromFilters(filters: Filters): FilterGroupId[] {
  const groups: FilterGroupId[] = [];

  if (filters.pricing.size > 0) {
    groups.push("pricing");
  }

  for (const section of SECTIONS) {
    if (getCategoryActiveCount(filters, section.id) > 0) {
      groups.push(section.id);
    }
  }

  return groups;
}

export function serialiseToParams(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.pricing.size > 0) {
    params.set("pricing", Array.from(filters.pricing).sort().join(","));
  }

  for (const [category, values] of Object.entries(filters.byCategory)) {
    if (values.size > 0) {
      params.set(category, Array.from(values).sort().join(","));
    }
  }

  if (filters.releaseYear.min) {
    params.set("releaseYearMin", filters.releaseYear.min);
  }

  if (filters.releaseYear.max) {
    params.set("releaseYearMax", filters.releaseYear.max);
  }

  if (filters.originCountries.size > 0) {
    params.set(
      "originCountry",
      Array.from(filters.originCountries).sort().join(","),
    );
  }

  return params;
}

function getValidCategoryFilterKeys(category: FilterCategory) {
  if (category === "general") {
    return GENERAL_FILTER_KEYS;
  }

  const section = SECTIONS.find((candidate) => candidate.id === category);
  return new Set(Object.keys(section?.labels ?? {}));
}

export function parseFromParams(params: URLSearchParams): Filters {
  const filters = emptyFilters();
  const pricing = params.get("pricing");

  if (pricing) {
    for (const value of pricing.split(",")) {
      if (value === "free" || value === "freemium" || value === "paid") {
        filters.pricing.add(value);
      }
    }
  }

  for (const category of FILTER_CATEGORIES) {
    const raw = params.get(category);
    if (!raw) continue;

    const validKeys = getValidCategoryFilterKeys(category);
    for (const key of raw.split(",")) {
      if (validKeys.has(key)) {
        filters.byCategory[category].add(key);
      }
    }
  }

  const releaseYearMin = params.get("releaseYearMin");
  if (releaseYearMin) {
    filters.releaseYear.min = releaseYearMin.replace(/[^\d]/g, "").slice(0, 4);
  }

  const releaseYearMax = params.get("releaseYearMax");
  if (releaseYearMax) {
    filters.releaseYear.max = releaseYearMax.replace(/[^\d]/g, "").slice(0, 4);
  }

  const originCountry = params.get("originCountry");
  if (originCountry) {
    for (const code of originCountry.split(",")) {
      if (code === EUROPE_OPTION.code || code in ALL_COUNTRIES) {
        filters.originCountries.add(code as OriginFilterValue);
      }
    }
  }

  return filters;
}
