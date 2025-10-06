// Modified from react-js-cron (MIT licensed)
// Original copyright (c) 2021 Xavier Rutayisire
// https://github.com/xrutayisire/react-js-cron

// @ts-nocheck

import { MultiSelect } from "@ui/multi-select";
import { useCallback, useMemo } from "react";
import { formatValue, parsePartArray, partToString } from "../converter";
import { DEFAULT_LOCALE_EN } from "../locale";
import { CustomSelectProps } from "../types";

export function CustomSelect(props: CustomSelectProps) {
  const {
    value,
    grid = true,
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

  const options = useMemo(
    () => {
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
        .map((e, index) => {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [optionsList, leadingZero, humanizeLabels, clockFormat],
  );
  const localeJSON = JSON.stringify(locale);
  const renderTag = useCallback(
    (props: { value: string[] | undefined }) => {
      const { value: itemValue } = props;

      if (!value || value[0] !== Number(itemValue)) {
        return <></>;
      }

      const parsedArray = parsePartArray(value, unit);
      const cronValue = partToString(
        parsedArray,
        unit,
        humanizeLabels,
        leadingZero,
        clockFormat,
      );
      const testEveryValue = cronValue.match(/^\*\/([0-9]+),?/) || [];

      return (
        <div>
          {testEveryValue[1]
            ? `${locale.everyText || DEFAULT_LOCALE_EN.everyText} ${
                testEveryValue[1]
              }`
            : cronValue}
        </div>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, localeJSON, humanizeLabels, leadingZero, clockFormat],
  );

  const onOptionClick = useCallback(
    (values: string[]) => {
      if (readOnly) return;
      const newValue = values;

      if (newValue.length === unit.total) {
        setValue([]);
      } else {
        setValue(newValue);
      }
    },
    [readOnly],
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
