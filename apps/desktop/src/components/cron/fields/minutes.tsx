// Modified from react-js-cron (MIT licensed)
// Original copyright (c) 2021 Xavier Rutayisire
// https://github.com/xrutayisire/react-js-cron

// @ts-nocheck

import { useMemo } from "react";

import { CustomSelect } from "@desktop/components/cron/fields/select";
import { UNITS } from "../constants";
import { DEFAULT_LOCALE_EN } from "../locale";
import { MinutesProps } from "../types";
import { classNames } from "../utils";

export function Minutes(props: MinutesProps) {
  const {
    value,
    setValue,
    locale,
    className,
    disabled,
    readOnly,
    leadingZero,
    clockFormat,
    period,
    periodicityOnDoubleClick,
    mode,
    allowClear,
    filterOption,
    getPopupContainer,
  } = props;
  const internalClassName = useMemo(
    () =>
      classNames({
        "react-js-cron-field": true,
        "react-js-cron-minutes": true,
        [`${className}-field`]: !!className,
        [`${className}-minutes`]: !!className,
      }),
    [className],
  );

  return (
    <div className="flex items-center gap-2">
      {period === "hour"
        ? locale.prefixMinutesForHourPeriod !== "" && (
            <span>
              {locale.prefixMinutesForHourPeriod ||
                DEFAULT_LOCALE_EN.prefixMinutesForHourPeriod}
            </span>
          )
        : locale.prefixMinutes !== "" && (
            <span>
              {locale.prefixMinutes || DEFAULT_LOCALE_EN.prefixMinutes}
            </span>
          )}

      <CustomSelect
        placeholder={
          period === "hour"
            ? locale.emptyMinutesForHourPeriod ||
              DEFAULT_LOCALE_EN.emptyMinutesForHourPeriod
            : locale.emptyMinutes || DEFAULT_LOCALE_EN.emptyMinutes
        }
        value={value}
        unit={UNITS[0]}
        setValue={setValue}
        locale={locale}
        className={className}
        disabled={disabled}
        readOnly={readOnly}
        leadingZero={leadingZero}
        clockFormat={clockFormat}
        period={period}
        periodicityOnDoubleClick={periodicityOnDoubleClick}
        mode={mode}
        allowClear={allowClear}
        filterOption={filterOption}
        getPopupContainer={getPopupContainer}
      />

      {period === "hour" && locale.suffixMinutesForHourPeriod !== "" && (
        <span>
          {locale.suffixMinutesForHourPeriod ||
            DEFAULT_LOCALE_EN.suffixMinutesForHourPeriod}
        </span>
      )}
    </div>
  );
}
