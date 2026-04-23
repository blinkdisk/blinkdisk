import { Button } from "@blinkdisk/ui/button";
import { cn } from "@blinkdisk/utils/class";
import { RotateCcwIcon, TagIcon, XIcon } from "lucide-react";

import { GENERAL_FILTER_KEYS, PRICING_OPTIONS, SECTIONS } from "./constants";
import { FilterCheckboxRow } from "./FilterCheckboxRow";
import { FilterGroup } from "./FilterGroup";
import { OriginCountryCombobox } from "./OriginCountryCombobox";
import { ReleaseYearRangeFields } from "./ReleaseYearRangeFields";
import type {
  FilterCategory,
  FilterGroupId,
  Filters,
  OriginOption,
  ReleaseYearRange,
} from "./types";
import { getCategoryActiveCount } from "./utils";

type FiltersPanelProps = {
  filters: Filters;
  openGroups: FilterGroupId[];
  activeCount: number;
  mobileFiltersOpen: boolean;
  resultCount: number;
  countryQuery: string;
  originOptions: OriginOption[];
  selectedCountryOptions: OriginOption[];
  minAvailableReleaseYear?: number;
  maxAvailableReleaseYear?: number;
  onToggleGroup: (group: FilterGroupId) => void;
  onTogglePricing: (
    value: Filters["pricing"] extends Set<infer T> ? T : never,
  ) => void;
  onToggleCategoryKey: (category: FilterCategory, key: string) => void;
  onUpdateReleaseYear: (bound: keyof ReleaseYearRange, value: string) => void;
  onOriginCountriesChange: (options: OriginOption[]) => void;
  onCountryQueryChange: (value: string) => void;
  onResetAll: () => void;
  onCloseMobileFilters: () => void;
};

export function FiltersPanel({
  filters,
  openGroups,
  activeCount,
  mobileFiltersOpen,
  resultCount,
  countryQuery,
  originOptions,
  selectedCountryOptions,
  minAvailableReleaseYear,
  maxAvailableReleaseYear,
  onToggleGroup,
  onTogglePricing,
  onToggleCategoryKey,
  onUpdateReleaseYear,
  onOriginCountriesChange,
  onCountryQueryChange,
  onResetAll,
  onCloseMobileFilters,
}: FiltersPanelProps) {
  const pricingGroup = (
    <FilterGroup
      id="pricing"
      title="Pricing"
      icon={TagIcon}
      activeCount={filters.pricing.size}
      open={openGroups.includes("pricing")}
      onToggle={() => onToggleGroup("pricing")}
    >
      {PRICING_OPTIONS.map((option) => (
        <FilterCheckboxRow
          key={option.value}
          id={`pricing-${option.value}`}
          label={option.label}
          description={option.description}
          checked={filters.pricing.has(option.value)}
          onToggle={() => onTogglePricing(option.value)}
        />
      ))}
    </FilterGroup>
  );

  return (
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
            onClick={onResetAll}
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
            onClick={onCloseMobileFilters}
            className="text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Close filters"
          >
            <XIcon className="size-5" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-auto flex-col gap-6 overflow-y-auto md:pr-2">
        {SECTIONS.map((section) => {
          if (section.id === "general") {
            return (
              <div key="pricing-and-general" className="contents">
                {pricingGroup}
                <FilterGroup
                  id={section.id}
                  title={section.title}
                  icon={section.icon}
                  activeCount={getCategoryActiveCount(filters, section.id)}
                  open={openGroups.includes(section.id)}
                  onToggle={() => onToggleGroup(section.id)}
                >
                  {Object.keys(section.labels)
                    .filter((key) => GENERAL_FILTER_KEYS.has(key))
                    .map((key) => {
                      const label = section.labels[key];
                      if (!label) return null;

                      return (
                        <FilterCheckboxRow
                          key={key}
                          id={`${section.id}-${key}`}
                          label={label.text}
                          description={label.description}
                          checked={filters.byCategory[section.id].has(key)}
                          onToggle={() => onToggleCategoryKey(section.id, key)}
                        />
                      );
                    })}

                  <div className="flex flex-col gap-4 pt-1">
                    <ReleaseYearRangeFields
                      value={filters.releaseYear}
                      minAvailableReleaseYear={minAvailableReleaseYear}
                      maxAvailableReleaseYear={maxAvailableReleaseYear}
                      onChange={onUpdateReleaseYear}
                    />
                    <OriginCountryCombobox
                      originOptions={originOptions}
                      selectedCountryOptions={selectedCountryOptions}
                      query={countryQuery}
                      onQueryChange={onCountryQueryChange}
                      onValueChange={onOriginCountriesChange}
                    />
                  </div>
                </FilterGroup>
              </div>
            );
          }

          const keys = Object.keys(section.labels);

          if (keys.length === 0) return null;

          return (
            <FilterGroup
              key={section.id}
              id={section.id}
              title={section.title}
              icon={section.icon}
              activeCount={getCategoryActiveCount(filters, section.id)}
              open={openGroups.includes(section.id)}
              onToggle={() => onToggleGroup(section.id)}
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
                    onToggle={() => onToggleCategoryKey(section.id, key)}
                  />
                );
              })}
            </FilterGroup>
          );
        })}
      </div>

      {mobileFiltersOpen && (
        <div className="mt-6 shrink-0 md:hidden">
          <Button className="w-full" onClick={onCloseMobileFilters}>
            Show {resultCount} {resultCount === 1 ? "result" : "results"}
          </Button>
        </div>
      )}
    </aside>
  );
}
