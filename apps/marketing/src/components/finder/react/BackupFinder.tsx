import type { CountryCode } from "@blinkdisk/constants/countries";
import { Badge } from "@blinkdisk/ui/badge";
import { Button } from "@blinkdisk/ui/button";
import { cn } from "@blinkdisk/utils/class";
import type { NormalizedBackupTool } from "@blinkdisk/utils/tools";
import { SlidersHorizontalIcon } from "lucide-react";
import { useEffect, useMemo, useReducer } from "react";

import { ComparisonBar } from "./backup-finder/ComparisonBar";
import { COUNTRY_OPTIONS, EUROPE_OPTION } from "./backup-finder/constants";
import { FiltersPanel } from "./backup-finder/FiltersPanel";
import { ResultsSection } from "./backup-finder/ResultsSection";
import type {
  FilterCategory,
  FilterGroupId,
  Filters,
  OriginOption,
  ReleaseYearRange,
} from "./backup-finder/types";
import {
  buildCompareHref,
  countActive,
  emptyFilters,
  getOpenGroupsFromFilters,
  getToolOriginCountry,
  getToolReleaseYear,
  parseFromParams,
  serialiseToParams,
  toolMatchesFilters,
} from "./backup-finder/utils";

type BackupFinderProps = {
  tools: NormalizedBackupTool[];
};

const DEFAULT_OPEN_GROUPS: FilterGroupId[] = ["platforms"];

type BackupFinderState = {
  filters: Filters;
  openGroups: FilterGroupId[];
  mobileFiltersOpen: boolean;
  countryQuery: string;
  selectedComparisonSlugs: string[];
};

type BackupFinderAction =
  | { type: "setFilters"; filters: Filters }
  | { type: "toggleGroup"; group: FilterGroupId }
  | { type: "setMobileFiltersOpen"; open: boolean }
  | { type: "setCountryQuery"; query: string }
  | { type: "toggleComparisonSelection"; slug: string }
  | { type: "clearComparisonSelection" }
  | { type: "resetFilters" };

function getInitialOpenGroups(filters: Filters): FilterGroupId[] {
  const openGroups = getOpenGroupsFromFilters(filters);

  return openGroups.length > 0 ? openGroups : DEFAULT_OPEN_GROUPS;
}

function getInitialState(): BackupFinderState {
  if (typeof window === "undefined") {
    return {
      filters: emptyFilters(),
      openGroups: DEFAULT_OPEN_GROUPS,
      mobileFiltersOpen: false,
      countryQuery: "",
      selectedComparisonSlugs: [],
    };
  }

  const params = new URLSearchParams(window.location.search);
  const filters =
    Array.from(params.keys()).length > 0
      ? parseFromParams(params)
      : emptyFilters();

  return {
    filters,
    openGroups: getInitialOpenGroups(filters),
    mobileFiltersOpen: false,
    countryQuery: "",
    selectedComparisonSlugs: [],
  };
}

function backupFinderReducer(
  state: BackupFinderState,
  action: BackupFinderAction,
): BackupFinderState {
  switch (action.type) {
    case "setFilters":
      return { ...state, filters: action.filters };
    case "toggleGroup":
      return {
        ...state,
        openGroups: state.openGroups.includes(action.group)
          ? state.openGroups.filter((value) => value !== action.group)
          : [...state.openGroups, action.group],
      };
    case "setMobileFiltersOpen":
      return { ...state, mobileFiltersOpen: action.open };
    case "setCountryQuery":
      return { ...state, countryQuery: action.query };
    case "toggleComparisonSelection":
      return {
        ...state,
        selectedComparisonSlugs: state.selectedComparisonSlugs.includes(
          action.slug,
        )
          ? state.selectedComparisonSlugs.filter(
              (value) => value !== action.slug,
            )
          : [...state.selectedComparisonSlugs, action.slug],
      };
    case "clearComparisonSelection":
      return { ...state, selectedComparisonSlugs: [] };
    case "resetFilters":
      return {
        ...state,
        filters: emptyFilters(),
        countryQuery: "",
      };
  }
}

function getAvailableFilters(
  filters: Filters,
  availableOriginCountryCodes: Set<CountryCode>,
) {
  const nextOriginCountries = new Set(
    Array.from(filters.originCountries).filter(
      (code) =>
        code === EUROPE_OPTION.code || availableOriginCountryCodes.has(code),
    ),
  );

  if (nextOriginCountries.size === filters.originCountries.size) {
    return filters;
  }

  return {
    ...filters,
    originCountries: nextOriginCountries,
  };
}

export function BackupFinder({ tools }: BackupFinderProps) {
  const [state, dispatch] = useReducer(
    backupFinderReducer,
    null,
    getInitialState,
  );
  const {
    countryQuery,
    mobileFiltersOpen,
    openGroups,
    selectedComparisonSlugs,
  } = state;

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

  const originOptions = useMemo<OriginOption[]>(
    () => [
      EUROPE_OPTION,
      ...COUNTRY_OPTIONS.filter((country) =>
        availableOriginCountryCodes.has(country.code),
      ),
    ],
    [availableOriginCountryCodes],
  );

  const filters = useMemo(
    () => getAvailableFilters(state.filters, availableOriginCountryCodes),
    [availableOriginCountryCodes, state.filters],
  );

  const selectedCountryOptions = useMemo(
    () =>
      originOptions.filter((option) =>
        filters.originCountries.has(option.code),
      ),
    [filters.originCountries, originOptions],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = serialiseToParams(filters);
    const queryString = params.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;

    window.history.replaceState(null, "", nextUrl);
  }, [filters]);

  const { results, zeroMatches } = useMemo(() => {
    const scoredTools = tools.map((tool) => ({
      tool,
      ...toolMatchesFilters(tool, filters),
    }));
    const matchingTools = scoredTools.filter((tool) => tool.matches);

    matchingTools.sort((left, right) => {
      if (right.fullCount !== left.fullCount) {
        return right.fullCount - left.fullCount;
      }

      if (right.partialCount !== left.partialCount) {
        return right.partialCount - left.partialCount;
      }

      return left.tool.name.localeCompare(right.tool.name);
    });

    return {
      results: matchingTools.map((tool) => tool.tool),
      zeroMatches: matchingTools.length === 0,
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
    dispatch({ type: "toggleGroup", group });
  };

  const togglePricing = (value: NormalizedBackupTool["pricing"]) => {
    const nextPricing = new Set(filters.pricing);
    if (nextPricing.has(value)) nextPricing.delete(value);
    else nextPricing.add(value);

    dispatch({
      type: "setFilters",
      filters: { ...filters, pricing: nextPricing },
    });
  };

  const toggleCategoryKey = (category: FilterCategory, key: string) => {
    const nextCategoryFilters = new Set(filters.byCategory[category]);
    if (nextCategoryFilters.has(key)) nextCategoryFilters.delete(key);
    else nextCategoryFilters.add(key);

    dispatch({
      type: "setFilters",
      filters: {
        ...filters,
        byCategory: {
          ...filters.byCategory,
          [category]: nextCategoryFilters,
        },
      },
    });
  };

  const updateReleaseYear = (bound: keyof ReleaseYearRange, value: string) => {
    const normalized = value.replace(/[^\d]/g, "").slice(0, 4);

    dispatch({
      type: "setFilters",
      filters: {
        ...filters,
        releaseYear: {
          ...filters.releaseYear,
          [bound]: normalized,
        },
      },
    });
  };

  const updateOriginCountries = (options: OriginOption[]) => {
    dispatch({
      type: "setFilters",
      filters: {
        ...filters,
        originCountries: new Set(options.map((option) => option.code)),
      },
    });
  };

  const resetAll = () => {
    dispatch({ type: "resetFilters" });
  };

  const toggleComparisonSelection = (slug: string) => {
    dispatch({ type: "toggleComparisonSelection", slug });
  };

  const startComparison = () => {
    if (!canCompare || typeof window === "undefined") return;

    window.open(
      buildCompareHref(selectedComparisonSlugs),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const clearComparisonSelection = () => {
    dispatch({ type: "clearComparisonSelection" });
  };

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 gap-6 md:grid-cols-[18rem_1fr] md:gap-8 lg:grid-cols-[20rem_1fr]",
          selectedComparisonSlugs.length > 0 && "pb-40 md:pb-32",
        )}
      >
        <div className="flex items-center justify-between md:hidden">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              dispatch({ type: "setMobileFiltersOpen", open: true })
            }
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

        <FiltersPanel
          filters={filters}
          openGroups={openGroups}
          activeCount={activeCount}
          mobileFiltersOpen={mobileFiltersOpen}
          resultCount={results.length}
          countryQuery={countryQuery}
          originOptions={originOptions}
          selectedCountryOptions={selectedCountryOptions}
          minAvailableReleaseYear={minAvailableReleaseYear}
          maxAvailableReleaseYear={maxAvailableReleaseYear}
          onToggleGroup={toggleGroup}
          onTogglePricing={togglePricing}
          onToggleCategoryKey={toggleCategoryKey}
          onUpdateReleaseYear={updateReleaseYear}
          onOriginCountriesChange={updateOriginCountries}
          onCountryQueryChange={(query) =>
            dispatch({ type: "setCountryQuery", query })
          }
          onResetAll={resetAll}
          onCloseMobileFilters={() =>
            dispatch({ type: "setMobileFiltersOpen", open: false })
          }
        />

        <ResultsSection
          results={results}
          zeroMatches={zeroMatches}
          activeCount={activeCount}
          selectedComparisonSlugs={selectedComparisonSlugs}
          onResetAll={resetAll}
          onToggleComparison={toggleComparisonSelection}
        />
      </div>

      <ComparisonBar
        selectedTools={selectedComparisonTools}
        canCompare={canCompare}
        onClearSelection={clearComparisonSelection}
        onRemoveSelection={toggleComparisonSelection}
        onCompare={startComparison}
      />
    </>
  );
}
