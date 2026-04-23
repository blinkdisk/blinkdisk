import type { CountryCode } from "@blinkdisk/constants/countries";
import { Badge } from "@blinkdisk/ui/badge";
import { Button } from "@blinkdisk/ui/button";
import { cn } from "@blinkdisk/utils/class";
import type { NormalizedBackupTool } from "@blinkdisk/utils/tools";
import { SlidersHorizontalIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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

function getInitialOpenGroups(filters: Filters): FilterGroupId[] {
  const openGroups = getOpenGroupsFromFilters(filters);

  return openGroups.length > 0 ? openGroups : DEFAULT_OPEN_GROUPS;
}

export function BackupFinder({ tools }: BackupFinderProps) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [openGroups, setOpenGroups] =
    useState<FilterGroupId[]>(DEFAULT_OPEN_GROUPS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const [selectedComparisonSlugs, setSelectedComparisonSlugs] = useState<
    string[]
  >([]);
  const hydrated = useRef(false);

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

  const selectedCountryOptions = useMemo(
    () =>
      originOptions.filter((option) =>
        filters.originCountries.has(option.code),
      ),
    [filters.originCountries, originOptions],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (Array.from(params.keys()).length > 0) {
      const parsedFilters = parseFromParams(params);
      setFilters(parsedFilters);
      setOpenGroups(getInitialOpenGroups(parsedFilters));
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydrated.current) return;

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
    setOpenGroups((current) =>
      current.includes(group)
        ? current.filter((value) => value !== group)
        : [...current, group],
    );
  };

  const togglePricing = (value: NormalizedBackupTool["pricing"]) => {
    setFilters((current) => {
      const nextPricing = new Set(current.pricing);
      if (nextPricing.has(value)) nextPricing.delete(value);
      else nextPricing.add(value);

      return { ...current, pricing: nextPricing };
    });
  };

  const toggleCategoryKey = (category: FilterCategory, key: string) => {
    setFilters((current) => {
      const nextCategoryFilters = new Set(current.byCategory[category]);
      if (nextCategoryFilters.has(key)) nextCategoryFilters.delete(key);
      else nextCategoryFilters.add(key);

      return {
        ...current,
        byCategory: {
          ...current.byCategory,
          [category]: nextCategoryFilters,
        },
      };
    });
  };

  const updateReleaseYear = (bound: keyof ReleaseYearRange, value: string) => {
    const normalized = value.replace(/[^\d]/g, "").slice(0, 4);

    setFilters((current) => ({
      ...current,
      releaseYear: {
        ...current.releaseYear,
        [bound]: normalized,
      },
    }));
  };

  const updateOriginCountries = (options: OriginOption[]) => {
    setFilters((current) => ({
      ...current,
      originCountries: new Set(options.map((option) => option.code)),
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

  const clearComparisonSelection = () => {
    setSelectedComparisonSlugs([]);
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
          onCountryQueryChange={setCountryQuery}
          onResetAll={resetAll}
          onCloseMobileFilters={() => setMobileFiltersOpen(false)}
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
