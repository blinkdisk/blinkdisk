// Modified from react-js-cron (MIT licensed)
// Original copyright (c) 2021 Xavier Rutayisire
// https://github.com/xrutayisire/react-js-cron

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@blinkdisk/ui/select";
import { formatValue } from "@desktop/components/cron/converter";
import type { CustomSelectProps } from "@desktop/components/cron/types";

export function CustomSelect(props: CustomSelectProps) {
  const {
    value,
    optionsList,
    setValue,
    humanizeLabels,
    disabled,
    readOnly,
    leadingZero,
    clockFormat,
    unit,
    filterOption = () => true,
    placeholder,
  } = props;

  const stringValue = (() => {
    if (value && Array.isArray(value)) {
      return value.map((value: number) => value.toString());
    }
  })();

  const options = (() => {
    const result: { value: string; label: string }[] = [];

    if (optionsList) {
      for (const [index, option] of optionsList.entries()) {
        const number = unit.min === 0 ? index : index + 1;
        const item = {
          value: number.toString(),
          label: option,
        };

        if (filterOption(item)) result.push(item);
      }

      return result;
    }

    for (let index = 0; index < unit.total; index++) {
      const number = unit.min === 0 ? index : index + 1;
      const item = {
        value: number.toString(),
        label: formatValue(
          number,
          unit,
          humanizeLabels,
          leadingZero,
          clockFormat,
        ),
      };

      if (filterOption(item)) result.push(item);
    }

    return result;
  })();

  const onOptionClick = (values: string[]) => {
    if (readOnly) return;
    const newValue = values;

    if (newValue.length === unit.total) {
      setValue([]);
    } else {
      setValue(newValue.map((v) => Number(v)));
    }
  };

  return (
    <Select
      items={options}
      value={stringValue || []}
      onValueChange={onOptionClick}
      disabled={disabled || readOnly}
      multiple
    >
      <SelectTrigger className="h-10 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
