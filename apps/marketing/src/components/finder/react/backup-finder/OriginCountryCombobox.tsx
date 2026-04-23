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
import { Fragment } from "react";

import { EUROPE_OPTION } from "./constants";
import type { OriginOption } from "./types";

type OriginCountryComboboxProps = {
  originOptions: OriginOption[];
  selectedCountryOptions: OriginOption[];
  query: string;
  onQueryChange: (value: string) => void;
  onValueChange: (options: OriginOption[]) => void;
};

export function OriginCountryCombobox({
  originOptions,
  selectedCountryOptions,
  query,
  onQueryChange,
  onValueChange,
}: OriginCountryComboboxProps) {
  const anchor = useComboboxAnchor();

  return (
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
        inputValue={query}
        itemToStringLabel={(option) => option.name}
        isItemEqualToValue={(item, value) => item.code === value.code}
        filter={(option, currentQuery) => {
          const normalizedQuery = currentQuery.trim().toLowerCase();
          if (!normalizedQuery) return true;
          return (
            option.name.toLowerCase().includes(normalizedQuery) ||
            option.code.toLowerCase().includes(normalizedQuery)
          );
        }}
        onInputValueChange={onQueryChange}
        onValueChange={onValueChange}
      >
        <ComboboxChips ref={anchor} className="w-full">
          <ComboboxValue>
            {(values) => (
              <>
                {Array.isArray(values) &&
                  values.map((option) => (
                    <ComboboxChip key={option.code}>
                      {option.emoji} {option.name}
                    </ComboboxChip>
                  ))}
                <ComboboxChipsInput placeholder="Search countries" showClear />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No countries found.</ComboboxEmpty>
          <ComboboxList>
            {(option) => (
              <Fragment key={option.code}>
                <ComboboxItem value={option}>
                  {option.emoji} {option.name}
                </ComboboxItem>
                {option.code === EUROPE_OPTION.code && <ComboboxSeparator />}
              </Fragment>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
