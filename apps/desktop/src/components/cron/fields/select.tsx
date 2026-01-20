// Modified from react-js-cron (MIT licensed)
// Original copyright (c) 2021 Xavier Rutayisire
// https://github.com/xrutayisire/react-js-cron

import { MultiSelect } from "@ui/multi-select";
import { useCallback, useMemo } from "react";
import { formatValue } from "../converter";
import { CustomSelectProps } from "../types";

export function CustomSelect(props: CustomSelectProps) {
  const {
    value,
    optionsList,
    setValue,
    locale,
    className,
    humanizeLabels,
    disabled,
    readOnly,
    leadingZero,
    clockFormat,
    period,
    unit,
    periodicityOnDoubleClick,
    mode,
    allowClear,
    filterOption = () => true,
    ...otherProps
  } = props;

  const stringValue = useMemo(() => {
    if (value && Array.isArray(value)) {
      return value.map((value: number) => value.toString());
    }
  }, [value]);

  const options = useMemo(() => {
    if (optionsList) {
      return optionsList
        .map((option, index) => {
          const number = unit.min === 0 ? index : index + 1;

          return {
            value: number.toString(),
            label: option,
          };
        })
        .filter(filterOption);
    }

    return [...Array(unit.total)]
      .map((_, index) => {
        const number = unit.min === 0 ? index : index + 1;

        return {
          value: number.toString(),
          label: formatValue(
            number,
            unit,
            humanizeLabels,
            leadingZero,
            clockFormat,
          ),
        };
      })
      .filter(filterOption);
  }, [
    optionsList,
    leadingZero,
    humanizeLabels,
    clockFormat,
    unit,
    filterOption,
  ]);

  const onOptionClick = useCallback(
    (values: string[]) => {
      if (readOnly) return;
      const newValue = values;

      if (newValue.length === unit.total) {
        setValue([]);
      } else {
        setValue(newValue.map((v) => Number(v)));
      }
    },
    [readOnly, setValue, unit.total],
  );

  return (
    <MultiSelect
      value={stringValue || []}
      onChange={onOptionClick}
      disabled={disabled || readOnly}
      options={options}
      triggerClassName="h-10 text-xs"
      {...otherProps}
    />
  );
}
