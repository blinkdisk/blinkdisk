// Modified from react-js-cron (MIT licensed)
// Original copyright (c) 2021 Xavier Rutayisire
// https://github.com/xrutayisire/react-js-cron

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { useCallback } from "react";

import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE_EN } from "../locale";
import { PeriodProps, PeriodType } from "../types";

export function Period(props: PeriodProps) {
  const {
    value,
    setValue,
    locale,
    disabled,
    readOnly,
    shortcuts,
    allowedPeriods,
  } = props;

  const { t } = useTranslation("cron");

  const options: { value: string; label: string }[] = [];

  if (allowedPeriods.includes("year")) {
    options.push({
      value: "year",
      label: locale.yearOption || DEFAULT_LOCALE_EN.yearOption,
    });
  }

  if (allowedPeriods.includes("month")) {
    options.push({
      value: "month",
      label: locale.monthOption || DEFAULT_LOCALE_EN.monthOption,
    });
  }

  if (allowedPeriods.includes("week")) {
    options.push({
      value: "week",
      label: locale.weekOption || DEFAULT_LOCALE_EN.weekOption,
    });
  }

  if (allowedPeriods.includes("day")) {
    options.push({
      value: "day",
      label: locale.dayOption || DEFAULT_LOCALE_EN.dayOption,
    });
  }

  if (allowedPeriods.includes("hour")) {
    options.push({
      value: "hour",
      label: locale.hourOption || DEFAULT_LOCALE_EN.hourOption,
    });
  }

  if (allowedPeriods.includes("minute")) {
    options.push({
      value: "minute",
      label: locale.minuteOption || DEFAULT_LOCALE_EN.minuteOption,
    });
  }

  if (
    allowedPeriods.includes("reboot") &&
    shortcuts &&
    (shortcuts === true || shortcuts.includes("@reboot"))
  ) {
    options.push({
      value: "reboot",
      label: locale.rebootOption || DEFAULT_LOCALE_EN.rebootOption,
    });
  }

  const handleChange = useCallback(
    (newValue: PeriodType) => {
      if (!readOnly) {
        setValue(newValue);
      }
    },
    [setValue, readOnly],
  );

  return (
    <div className="flex items-center gap-2">
      {locale.prefixPeriod !== "" && (
        <span>{locale.prefixPeriod || DEFAULT_LOCALE_EN.prefixPeriod}</span>
      )}

      <Select
        key={JSON.stringify(locale)}
        defaultValue={value}
        value={value}
        onValueChange={handleChange}
        disabled={disabled || readOnly}
        open={readOnly ? false : undefined}
        data-testid="select-period"
      >
        <SelectTrigger className="h-10 gap-1 text-xs">
          <SelectValue placeholder={t("period")} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
