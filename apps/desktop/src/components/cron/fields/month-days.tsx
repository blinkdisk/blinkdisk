// Modified from react-js-cron (MIT licensed)
// Original copyright (c) 2021 Xavier Rutayisire
// https://github.com/xrutayisire/react-js-cron

import { useMemo } from "react";

import { CustomSelect } from "@desktop/components/cron/fields/select";
import { UNITS } from "../constants";
import { DEFAULT_LOCALE_EN } from "../locale";
import { MonthDaysProps } from "../types";

export function MonthDays(props: MonthDaysProps) {
  const {
    value,
    setValue,
    locale,
    className,
    weekDays,
    disabled,
    readOnly,
    leadingZero,
    period,
    periodicityOnDoubleClick,
    mode,
    allowClear,
    filterOption,
    getPopupContainer,
  } = props;
  const noWeekDays = !weekDays || weekDays.length === 0;

  const localeJSON = JSON.stringify(locale);
  const placeholder = useMemo(() => {
    if (noWeekDays) {
      return locale.emptyMonthDays || DEFAULT_LOCALE_EN.emptyMonthDays;
    }

    return locale.emptyMonthDaysShort || DEFAULT_LOCALE_EN.emptyMonthDaysShort;
    // eslint-disable-next-line
  }, [noWeekDays, localeJSON]);

  const displayMonthDays =
    !readOnly ||
    (value && value.length > 0) ||
    ((!value || value.length === 0) && (!weekDays || weekDays.length === 0));

  return displayMonthDays ? (
    <div className="flex items-center gap-2">
      {locale.prefixMonthDays !== "" && (
        <span>
          {locale.prefixMonthDays || DEFAULT_LOCALE_EN.prefixMonthDays}
        </span>
      )}

      <CustomSelect
        placeholder={placeholder}
        value={value}
        setValue={setValue}
        unit={UNITS[2]!}
        locale={locale}
        className={className}
        disabled={disabled}
        readOnly={readOnly}
        leadingZero={leadingZero}
        period={period}
        periodicityOnDoubleClick={periodicityOnDoubleClick}
        mode={mode}
        allowClear={allowClear}
        filterOption={filterOption}
        getPopupContainer={getPopupContainer}
      />
    </div>
  ) : null;
}
