import {
  COMPARISON_FEATURE_LABELS,
  COMPARISON_GENERAL_LABELS,
  COMPARISON_INTERFACE_LABELS,
  COMPARISON_LEVEL_LABELS,
  COMPARISON_PLATFORM_LABELS,
  COMPARISON_PRIVACY_LABELS,
  COMPARISON_STORAGE_LABELS,
  COMPARISON_STRATEGY_LABELS,
  type LabelConfig,
} from "@blinkdisk/constants/comparison";
import {
  ALL_COUNTRIES,
  type Country,
  type CountryCode,
} from "@blinkdisk/constants/countries";
import { Badge } from "@blinkdisk/ui/badge";
import { Button } from "@blinkdisk/ui/button";
import { Checkbox } from "@blinkdisk/ui/checkbox";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from "@blinkdisk/ui/combobox";
import { Input } from "@blinkdisk/ui/input";
import { cn } from "@blinkdisk/utils/class";
import {
  type NormalizedBackupTool,
  type NormalizedCellValue,
} from "@blinkdisk/utils/tools";
import {
  FinderResultCard,
  type SelectedKey,
} from "@marketing/components/finder/react/FinderResultCard";
import {
  AppWindowIcon,
  ChevronDownIcon,
  HardDriveIcon,
  InfoIcon,
  LayersIcon,
  ListChecksIcon,
  MonitorIcon,
  RotateCcwIcon,
  ScaleIcon,
  SearchXIcon,
  ShieldIcon,
  SlidersHorizontalIcon,
  TagIcon,
  XIcon,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

type FilterCategory = SelectedKey["category"];
type FilterGroupId = "pricing" | FilterCategory;

type SectionConfig = {
  id: FilterCategory;
  title: string;
  icon: typeof ListChecksIcon;
  labels: Record<string, LabelConfig>;
};

const SECTIONS: SectionConfig[] = [
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
const GENERAL_FILTER_KEYS = new Set(["openSource"]);

const PRICING_OPTIONS: {
  value: NormalizedBackupTool["pricing"];
  label: string;
  description: string;
}[] = [
  { value: "free", label: "Free", description: "All features free" },
  { value: "freemium", label: "Freemium", description: "Has paid features" },
  { value: "paid", label: "Paid", description: "Requires payment" },
];

type CountryOption = Country & { code: CountryCode };
type EuropeOption = {
  code: "EUROPE";
  name: "Europe";
  emoji: "🇪🇺";
  europe: true;
};
type OriginOption = CountryOption | EuropeOption;
type OriginFilterValue = CountryCode | EuropeOption["code"];

const EUROPE_OPTION: EuropeOption = {
  code: "EUROPE",
  name: "Europe",
  emoji: "🇪🇺",
  europe: true,
};

const COUNTRY_OPTIONS: CountryOption[] = Object.entries(ALL_COUNTRIES)
  .map(([code, country]) => ({
    code: code as CountryCode,
    emoji: country.emoji,
    name: country.name,
    europe: "europe" in country ? country.europe : undefined,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

type ReleaseYearRange = {
  min: string;
  max: string;
};

type Filters = {
  pricing: Set<NormalizedBackupTool["pricing"]>;
  byCategory: Record<FilterCategory, Set<string>>;
  releaseYear: ReleaseYearRange;
  originCountries: Set<OriginFilterValue>;
};

function emptyFilters(): Filters {
  return {
    pricing: new Set(),
    byCategory: {
      general: new Set(),
      level: new Set(),
      strategies: new Set(),
      features: new Set(),
      interface: new Set(),
      privacy: new Set(),
      platforms: new Set(),
      storages: new Set(),
    },
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

function getToolReleaseYear(tool: NormalizedBackupTool): number | null {
  return parseReleaseYearValue(tool.general.releaseYear.value);
}

function getToolOriginCountry(tool: NormalizedBackupTool): CountryCode | null {
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

function toolMatchesFilters(
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
  const categories: FilterCategory[] = [
    "general",
    "level",
    "strategies",
    "features",
    "interface",
    "privacy",
    "platforms",
    "storages",
  ];

  for (const cat of categories) {
    const selected = filters.byCategory[cat];
    if (selected.size === 0) continue;
    for (const key of selected) {
      const cell = ((tool[cat] ?? {}) as Record<string, NormalizedCellValue>)[
        key
      ] ?? {
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

function countActive(filters: Filters): number {
  let n = filters.pricing.size;
  for (const cat of Object.values(filters.byCategory)) n += cat.size;
  if (filters.releaseYear.min || filters.releaseYear.max) n += 1;
  if (filters.originCountries.size > 0) n += 1;
  return n;
}

function buildCompareHref(slugs: string[]) {
  return `/compare/${slugs.join("-vs-")}`;
}

function getCategoryActiveCount(
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

function getOpenGroupsFromFilters(filters: Filters): FilterGroupId[] {
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

function serialiseToParams(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.pricing.size > 0) {
    params.set("pricing", Array.from(filters.pricing).sort().join(","));
  }
  for (const [cat, set] of Object.entries(filters.byCategory)) {
    if (set.size > 0) {
      params.set(cat, Array.from(set).sort().join(","));
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

function parseFromParams(params: URLSearchParams): Filters {
  const filters = emptyFilters();
  const pricing = params.get("pricing");
  if (pricing) {
    for (const value of pricing.split(",")) {
      if (value === "free" || value === "freemium" || value === "paid") {
        filters.pricing.add(value);
      }
    }
  }
  const categories: FilterCategory[] = [
    "general",
    "level",
    "strategies",
    "features",
    "interface",
    "privacy",
    "platforms",
    "storages",
  ];
  for (const cat of categories) {
    const raw = params.get(cat);
    if (!raw) continue;
    const validKeys = new Set(
      cat === "general"
        ? Array.from(GENERAL_FILTER_KEYS)
        : Object.keys(SECTIONS.find((s) => s.id === cat)?.labels ?? {}),
    );
    for (const key of raw.split(",")) {
      if (validKeys.has(key)) filters.byCategory[cat].add(key);
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

type BackupFinderProps = {
  tools: NormalizedBackupTool[];
};

export function BackupFinder({ tools }: BackupFinderProps) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [openGroups, setOpenGroups] = useState<FilterGroupId[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const [selectedComparisonSlugs, setSelectedComparisonSlugs] = useState<
    string[]
  >([]);
  const hydrated = useRef(false);
  const countryAnchor = useComboboxAnchor();

  const availableReleaseYears = useMemo(
    () =>
      tools
        .map((tool) => getToolReleaseYear(tool))
        .filter((year): year is number => year !== null)
        .sort((a, b) => a - b),
    [tools],
  );
  const minAvailableReleaseYear = availableReleaseYears[0] ?? undefined;
  const maxAvailableReleaseYear =
    availableReleaseYears[availableReleaseYears.length - 1] ?? undefined;
  const availableOriginCountryCodes = useMemo(
    () =>
      new Set(
        tools
          .map((tool) => getToolOriginCountry(tool))
          .filter((code): code is CountryCode => code !== null),
      ),
    [tools],
  );
  const originOptions = useMemo(
    () => [
      EUROPE_OPTION,
      ...COUNTRY_OPTIONS.filter((country) =>
        availableOriginCountryCodes.has(country.code),
      ),
    ],
    [availableOriginCountryCodes],
  );
  const selectedCountryOptions = useMemo(
    () =>
      originOptions.filter((option) =>
        filters.originCountries.has(option.code),
      ),
    [filters.originCountries, originOptions],
  );

  // Hydrate from URL on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (Array.from(params.keys()).length > 0) {
      const parsedFilters = parseFromParams(params);
      setFilters(parsedFilters);
      setOpenGroups(getOpenGroupsFromFilters(parsedFilters));
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    setFilters((current) => {
      const nextOriginCountries = new Set(
        Array.from(current.originCountries).filter(
          (code) =>
            code === EUROPE_OPTION.code ||
            availableOriginCountryCodes.has(code),
        ),
      );
      if (nextOriginCountries.size === current.originCountries.size) {
        return current;
      }
      return {
        ...current,
        originCountries: nextOriginCountries,
      };
    });
  }, [availableOriginCountryCodes]);

  // Persist active filters to query string (shareable URLs, no history spam)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydrated.current) return;
    const params = serialiseToParams(filters);
    const qs = params.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", next);
  }, [filters]);

  const { results, zeroMatches } = useMemo(() => {
    const scored = tools.map((tool) => ({
      tool,
      ...toolMatchesFilters(tool, filters),
    }));
    const matching = scored.filter((s) => s.matches);
    matching.sort((a, b) => {
      if (b.fullCount !== a.fullCount) return b.fullCount - a.fullCount;
      if (b.partialCount !== a.partialCount)
        return b.partialCount - a.partialCount;
      return a.tool.name.localeCompare(b.tool.name);
    });
    return {
      results: matching.map((m) => m.tool),
      zeroMatches: matching.length === 0,
    };
  }, [tools, filters]);
  const selectedComparisonTools = useMemo(
    () =>
      selectedComparisonSlugs
        .map((slug) => tools.find((tool) => tool.slug === slug))
        .filter((tool): tool is NormalizedBackupTool => tool !== undefined),
    [selectedComparisonSlugs, tools],
  );

  const activeCount = countActive(filters);
  const canCompare = selectedComparisonSlugs.length >= 1;
  const toggleGroup = (group: FilterGroupId) => {
    setOpenGroups((current) =>
      current.includes(group)
        ? current.filter((value) => value !== group)
        : [...current, group],
    );
  };

  const togglePricing = (value: NormalizedBackupTool["pricing"]) => {
    setFilters((f) => {
      const next = new Set(f.pricing);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...f, pricing: next };
    });
  };

  const toggleCategoryKey = (category: FilterCategory, key: string) => {
    setFilters((f) => {
      const next = new Set(f.byCategory[category]);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return {
        ...f,
        byCategory: { ...f.byCategory, [category]: next },
      };
    });
  };

  const updateReleaseYear = (bound: keyof ReleaseYearRange, value: string) => {
    const normalized = value.replace(/[^\d]/g, "").slice(0, 4);
    setFilters((f) => ({
      ...f,
      releaseYear: {
        ...f.releaseYear,
        [bound]: normalized,
      },
    }));
  };

  const resetAll = () => {
    setCountryQuery("");
    setFilters(emptyFilters());
  };

  const toggleComparisonSelection = (slug: string) => {
    setSelectedComparisonSlugs((current) => {
      if (current.includes(slug)) {
        return current.filter((value) => value !== slug);
      }
      return [...current, slug];
    });
  };

  const startComparison = () => {
    if (!canCompare || typeof window === "undefined") return;
    window.open(
      buildCompareHref(selectedComparisonSlugs),
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 gap-6 md:grid-cols-[18rem_1fr] md:gap-8 lg:grid-cols-[20rem_1fr]",
          selectedComparisonSlugs.length > 0 && "pb-40 md:pb-32",
        )}
      >
        {/* Mobile toolbar */}
        <div className="flex items-center justify-between md:hidden">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontalIcon className="size-4" />
            Filters
            {activeCount > 0 && (
              <Badge variant="default" className="ml-1">
                {activeCount}
              </Badge>
            )}
          </Button>
          <p className="text-muted-foreground text-sm">
            {results.length} {results.length === 1 ? "match" : "matches"}
          </p>
        </div>

        {/* Filter aside (desktop) / drawer (mobile) */}
        <aside
          className={cn(
            "md:sticky md:top-32 md:flex md:max-h-[calc(100vh-10rem)] md:flex-col md:self-start",
            mobileFiltersOpen
              ? "max-md:bg-background max-md:fixed max-md:inset-0 max-md:z-[1020] max-md:flex max-md:flex-col max-md:p-4"
              : "hidden",
          )}
        >
          <div className="mb-4 flex shrink-0 items-center justify-between md:mb-6">
            <h2 className="text-foreground text-lg font-semibold">Filters</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetAll}
                disabled={activeCount === 0}
                className={cn(
                  "text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors",
                  activeCount === 0 && "pointer-events-none opacity-50",
                )}
              >
                <RotateCcwIcon className="size-3" />
                Reset all
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="text-muted-foreground hover:text-foreground md:hidden"
                aria-label="Close filters"
              >
                <XIcon className="size-5" />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-auto flex-col gap-6 overflow-y-auto md:pr-2">
            {/* Pricing */}
            <FilterGroup
              id="pricing"
              title="Pricing"
              icon={TagIcon}
              activeCount={filters.pricing.size}
              open={openGroups.includes("pricing")}
              onToggle={() => toggleGroup("pricing")}
            >
              {PRICING_OPTIONS.map((option) => (
                <FilterCheckboxRow
                  key={option.value}
                  id={`pricing-${option.value}`}
                  label={option.label}
                  description={option.description}
                  checked={filters.pricing.has(option.value)}
                  onToggle={() => togglePricing(option.value)}
                />
              ))}
            </FilterGroup>

            {SECTIONS.map((section) => {
              const keys =
                section.id === "general"
                  ? Object.keys(section.labels).filter((k) =>
                      GENERAL_FILTER_KEYS.has(k),
                    )
                  : Object.keys(section.labels);
              if (keys.length === 0) return null;
              return (
                <FilterGroup
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  icon={section.icon}
                  activeCount={getCategoryActiveCount(filters, section.id)}
                  open={openGroups.includes(section.id)}
                  onToggle={() => toggleGroup(section.id)}
                >
                  {keys.map((key) => {
                    const label = section.labels[key];
                    if (!label) return null;
                    return (
                      <FilterCheckboxRow
                        key={key}
                        id={`${section.id}-${key}`}
                        label={label.text}
                        description={label.description}
                        checked={filters.byCategory[section.id].has(key)}
                        onToggle={() => toggleCategoryKey(section.id, key)}
                      />
                    );
                  })}
                  {section.id === "general" && (
                    <div className="flex flex-col gap-4 pt-1">
                      <div className="flex flex-col gap-2">
                        <div>
                          <h4 className="text-foreground text-sm font-medium">
                            Release Year
                          </h4>
                        </div>
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                          <label>
                            <Input
                              type="number"
                              inputMode="numeric"
                              min={minAvailableReleaseYear}
                              max={maxAvailableReleaseYear}
                              placeholder={minAvailableReleaseYear?.toString()}
                              value={filters.releaseYear.min}
                              onChange={(event) =>
                                updateReleaseYear("min", event.target.value)
                              }
                            />
                          </label>
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                          <label>
                            <Input
                              type="number"
                              inputMode="numeric"
                              min={minAvailableReleaseYear}
                              max={maxAvailableReleaseYear}
                              placeholder={maxAvailableReleaseYear?.toString()}
                              value={filters.releaseYear.max}
                              onChange={(event) =>
                                updateReleaseYear("max", event.target.value)
                              }
                            />
                          </label>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div>
                          <h4 className="text-foreground text-sm font-medium">
                            Country of Origin
                          </h4>
                        </div>
                        <Combobox<OriginOption, true>
                          multiple
                          autoHighlight
                          items={originOptions}
                          value={selectedCountryOptions}
                          inputValue={countryQuery}
                          itemToStringLabel={(option) => option.name}
                          isItemEqualToValue={(item, value) =>
                            item.code === value.code
                          }
                          filter={(option, query) => {
                            const normalizedQuery = query.trim().toLowerCase();
                            if (!normalizedQuery) return true;
                            return (
                              option.name
                                .toLowerCase()
                                .includes(normalizedQuery) ||
                              option.code
                                .toLowerCase()
                                .includes(normalizedQuery)
                            );
                          }}
                          onInputValueChange={setCountryQuery}
                          onValueChange={(options) => {
                            setFilters((f) => ({
                              ...f,
                              originCountries: new Set(
                                options.map((option) => option.code),
                              ),
                            }));
                          }}
                        >
                          <ComboboxChips ref={countryAnchor} className="w-full">
                            <ComboboxValue>
                              {(values) => (
                                <>
                                  {Array.isArray(values) &&
                                    values.map((option) => (
                                      <ComboboxChip key={option.code}>
                                        {option.emoji} {option.name}
                                      </ComboboxChip>
                                    ))}
                                  <ComboboxChipsInput
                                    placeholder="Search countries"
                                    showClear
                                  />
                                </>
                              )}
                            </ComboboxValue>
                          </ComboboxChips>
                          <ComboboxContent anchor={countryAnchor}>
                            <ComboboxEmpty>No countries found.</ComboboxEmpty>
                            <ComboboxList>
                              {(option) => (
                                <Fragment key={option.code}>
                                  <ComboboxItem value={option}>
                                    {option.emoji} {option.name}
                                  </ComboboxItem>
                                  {option.code === EUROPE_OPTION.code && (
                                    <ComboboxSeparator />
                                  )}
                                </Fragment>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      </div>
                    </div>
                  )}
                </FilterGroup>
              );
            })}
          </div>

          {mobileFiltersOpen && (
            <div className="mt-6 shrink-0 md:hidden">
              <Button
                className="w-full"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Show {results.length}{" "}
                {results.length === 1 ? "result" : "results"}
              </Button>
            </div>
          )}
        </aside>

        {/* Results */}
        <section>
          <div className="mb-6 hidden items-center justify-between md:flex">
            <p className="text-muted-foreground text-sm">
              Showing{" "}
              <span className="text-foreground font-medium">
                {results.length}
              </span>{" "}
              {results.length === 1 ? "tool" : "tools"}
              {activeCount > 0 && <> matching your requirements</>}
            </p>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={resetAll}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
              >
                <RotateCcwIcon className="size-3.5" />
                Reset all
              </button>
            )}
          </div>

          {zeroMatches ? (
            <div className="bg-card flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
              <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
                <SearchXIcon className="size-6" />
              </div>
              <div>
                <h3 className="text-foreground text-lg font-semibold">
                  No tools match every requirement
                </h3>
                <p className="text-muted-foreground mt-1 max-w-md text-sm">
                  Try loosening your filters. Your current selection is too
                  restrictive — no single backup tool ticks every box.
                </p>
              </div>
              <Button size="sm" onClick={resetAll}>
                <RotateCcwIcon className="size-4" />
                Reset all filters
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {results.map((tool) => (
                <li key={tool.slug}>
                  <FinderResultCard
                    tool={tool}
                    isSelectedForComparison={selectedComparisonSlugs.includes(
                      tool.slug,
                    )}
                    onToggleComparison={toggleComparisonSelection}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {selectedComparisonTools.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[1010] px-4">
          <div className="bg-background/90 border-border/70 pointer-events-auto mx-auto flex w-full max-w-5xl flex-col gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-wrap gap-2">
              {selectedComparisonTools.map((tool) => (
                <button
                  key={tool.slug}
                  type="button"
                  onClick={() => toggleComparisonSelection(tool.slug)}
                  className="bg-muted text-foreground hover:bg-muted/80 inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors"
                  aria-label={`Remove ${tool.name} from comparison`}
                >
                  <span className="truncate">{tool.name}</span>
                  <XIcon className="text-muted-foreground size-3.5 shrink-0" />
                </button>
              ))}
            </div>

            <div className="md:shrink-0">
              <Button
                type="button"
                onClick={startComparison}
                disabled={!canCompare}
                className="w-full md:w-auto"
              >
                <ScaleIcon className="size-4" />
                Compare
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type FilterGroupProps = {
  id: FilterGroupId;
  title: string;
  description?: string;
  icon: typeof ListChecksIcon;
  activeCount: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function FilterGroup({
  id,
  title,
  description,
  icon: Icon,
  activeCount,
  open,
  onToggle,
  children,
}: FilterGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`filter-group-${id}`}
        className="group flex items-start gap-2 text-left"
      >
        <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
        <div className="flex-1">
          <h3 className="text-foreground text-sm font-semibold leading-tight">
            {title}
            {activeCount > 0 && (
              <span className="text-muted-foreground ml-1.5 text-xs font-normal">
                ({activeCount})
              </span>
            )}
          </h3>
          {description && (
            <p className="text-muted-foreground mt-0.5 text-xs">
              {description}
            </p>
          )}
        </div>
        <ChevronDownIcon
          className={cn(
            "text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div id={`filter-group-${id}`} className="flex flex-col gap-2.5 pl-6">
          {children}
        </div>
      )}
    </div>
  );
}

type FilterCheckboxRowProps = {
  id: string;
  label: string;
  description?: string;
  checked: React.ComponentProps<typeof Checkbox>["checked"];
  onToggle: () => void;
  className?: string;
};

function FilterCheckboxRow({
  id,
  label,
  description,
  checked,
  onToggle,
  className,
}: FilterCheckboxRowProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-2.5 text-sm",
        className,
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={() => onToggle()}
        className="mt-0.5"
      />
      <span className="flex-1 leading-tight">
        <span className="text-foreground font-medium">{label}</span>
        {description && (
          <span className="text-muted-foreground block text-xs">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
