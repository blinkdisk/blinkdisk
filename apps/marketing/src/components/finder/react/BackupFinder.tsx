import {
  COMPARISON_FEATURE_LABELS,
  COMPARISON_GENERAL_LABELS,
  COMPARISON_INTERFACE_LABELS,
  COMPARISON_LEVEL_LABELS,
  COMPARISON_PLATFORM_LABELS,
  COMPARISON_PRIVACY_LABELS,
  COMPARISON_STORAGE_LABELS,
  COMPARISON_STRATEGY_LABELS,
  type BackupTool,
  type CellValue,
  type LabelConfig,
  type SupportedValue,
} from "@blinkdisk/constants/comparison";
import { Badge } from "@blinkdisk/ui/badge";
import { Button } from "@blinkdisk/ui/button";
import { Checkbox } from "@blinkdisk/ui/checkbox";
import { cn } from "@blinkdisk/utils/class";
import {
  FinderResultCard,
  type SelectedKey,
} from "@marketing/components/finder/react/FinderResultCard";
import {
  AppWindowIcon,
  HardDriveIcon,
  InfoIcon,
  LayersIcon,
  ListChecksIcon,
  MonitorIcon,
  RotateCcwIcon,
  SearchXIcon,
  ShieldIcon,
  SlidersHorizontalIcon,
  TagIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type FilterCategory = SelectedKey["category"];

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
  value: BackupTool["pricing"];
  label: string;
  description: string;
}[] = [
  { value: "free", label: "Free", description: "All features free" },
  { value: "freemium", label: "Freemium", description: "Has paid features" },
  { value: "paid", label: "Paid", description: "Requires payment" },
];

type Filters = {
  pricing: Set<BackupTool["pricing"]>;
  byCategory: Record<FilterCategory, Set<string>>;
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
  };
}

function isSupported(v: CellValue): v is SupportedValue {
  return v !== null && "supported" in v;
}

function cellMatches(cell: CellValue): {
  matches: boolean;
  partial: boolean;
} {
  if (!isSupported(cell)) return { matches: false, partial: false };
  if (cell.supported === true) return { matches: true, partial: false };
  if (cell.supported === "partial") return { matches: true, partial: true };
  return { matches: false, partial: false };
}

function toolMatchesFilters(
  tool: BackupTool,
  filters: Filters,
): { matches: boolean; fullCount: number; partialCount: number } {
  if (filters.pricing.size > 0 && !filters.pricing.has(tool.pricing)) {
    return { matches: false, fullCount: 0, partialCount: 0 };
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
      const cell =
        ((tool[cat] ?? {}) as Record<string, CellValue>)[key] ?? null;
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
  return n;
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
  return filters;
}

type BackupFinderProps = {
  tools: BackupTool[];
};

export function BackupFinder({ tools }: BackupFinderProps) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const hydrated = useRef(false);

  // Hydrate from URL on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (Array.from(params.keys()).length > 0) {
      setFilters(parseFromParams(params));
    }
    hydrated.current = true;
  }, []);

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

  const activeCount = countActive(filters);

  const togglePricing = (value: BackupTool["pricing"]) => {
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

  const clearCategory = (category: FilterCategory) => {
    setFilters((f) => ({
      ...f,
      byCategory: { ...f.byCategory, [category]: new Set() },
    }));
  };

  const clearPricing = () => {
    setFilters((f) => ({ ...f, pricing: new Set() }));
  };

  const resetAll = () => {
    setFilters(emptyFilters());
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[18rem_1fr] md:gap-8 lg:grid-cols-[20rem_1fr]">
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
          "md:block",
          mobileFiltersOpen
            ? "bg-background fixed inset-0 z-[1020] flex flex-col overflow-y-auto p-4 md:static md:z-auto md:p-0"
            : "hidden",
        )}
      >
        <div className="mb-4 flex items-center justify-between md:mb-6">
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

        <div className="flex flex-col gap-6">
          {/* Pricing */}
          <FilterGroup
            title="Pricing"
            icon={TagIcon}
            activeCount={filters.pricing.size}
            onClear={clearPricing}
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
                title={section.title}
                icon={section.icon}
                activeCount={filters.byCategory[section.id].size}
                onClear={() => clearCategory(section.id)}
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
              </FilterGroup>
            );
          })}
        </div>

        {mobileFiltersOpen && (
          <div className="mt-6 md:hidden">
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
                <FinderResultCard tool={tool} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

type FilterGroupProps = {
  title: string;
  description?: string;
  icon: typeof ListChecksIcon;
  activeCount: number;
  onClear: () => void;
  children: React.ReactNode;
};

function FilterGroup({
  title,
  description,
  icon: Icon,
  activeCount,
  onClear,
  children,
}: FilterGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
          <div>
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
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2.5 pl-6">{children}</div>
    </div>
  );
}

type FilterCheckboxRowProps = {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
};

function FilterCheckboxRow({
  id,
  label,
  description,
  checked,
  onToggle,
}: FilterCheckboxRowProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2.5 text-sm"
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
