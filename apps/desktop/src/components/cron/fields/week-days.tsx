// Modified from react-js-cron (MIT licensed)
// Original copyright (c) 2021 Xavier Rutayisire
// https://github.com/xrutayisire/react-js-cron

import { useMemo } from "react";

import { CustomSelect } from "@desktop/components/cron/fields/select";
import { UNITS } from "../constants";
import { DEFAULT_LOCALE_EN } from "../locale";
import { WeekDaysProps } from "../types";

export function WeekDays(props: WeekDaysProps) {
  const {
    value,
    setValue,
    locale,
    className,
    humanizeLabels,
    monthDays,
    disabled,
    readOnly,
    period,
    periodicityOnDoubleClick,
    mode,
    allowClear,
    filterOption,
    getPopupContainer,
  } = props;
  const optionsList = locale.weekDays || DEFAULT_LOCALE_EN.weekDays;
  const noMonthDays = period === "week" || !monthDays || monthDays.length === 0;

  const localeJSON = JSON.stringify(locale);
  const placeholder = useMemo(() => {
    if (noMonthDays) {
      return locale.emptyWeekDays || DEFAULT_LOCALE_EN.emptyWeekDays;
    }

    return locale.emptyWeekDaysShort || DEFAULT_LOCALE_EN.emptyWeekDaysShort;
  }, [noMonthDays, localeJSON]);

  const displayWeekDays =
    period === "week" ||
    !readOnly ||
    (value && value.length > 0) ||
    ((!value || value.length === 0) && (!monthDays || monthDays.length === 0));

  const monthDaysIsDisplayed =
    !readOnly ||
    (monthDays && monthDays.length > 0) ||
    ((!monthDays || monthDays.length === 0) && (!value || value.length === 0));

  return displayWeekDays ? (
    <div className="flex items-center gap-2">
      {locale.prefixWeekDays !== "" &&
        (period === "week" || !monthDaysIsDisplayed) && (
          <span>
            {locale.prefixWeekDays || DEFAULT_LOCALE_EN.prefixWeekDays}
          </span>
        )}

      {locale.prefixWeekDaysForMonthAndYearPeriod !== "" &&
        period !== "week" &&
        monthDaysIsDisplayed && (
          <span>
            {locale.prefixWeekDaysForMonthAndYearPeriod ||
              DEFAULT_LOCALE_EN.prefixWeekDaysForMonthAndYearPeriod}
          </span>
        )}

      <CustomSelect
        placeholder={placeholder}
        optionsList={optionsList}
        grid={false}
        value={value}
        unit={{
          ...UNITS[4]!,
          // Allow translation of alternative labels when using "humanizeLabels"
          // Issue #3
          alt: locale.altWeekDays || DEFAULT_LOCALE_EN.altWeekDays,
        }}
        setValue={setValue}
        locale={locale}
        className={className}
        humanizeLabels={humanizeLabels}
        disabled={disabled}
        readOnly={readOnly}
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
