// Modified from react-js-cron (MIT licensed)
// Original copyright (c) 2021 Xavier Rutayisire
// https://github.com/xrutayisire/react-js-cron

import {
  getCronStringFromValues,
  setValuesFromCronString,
} from "@desktop/components/cron/converter";
import { Hours } from "@desktop/components/cron/fields/hours";
import { Minutes } from "@desktop/components/cron/fields/minutes";
import { MonthDays } from "@desktop/components/cron/fields/month-days";
import { Months } from "@desktop/components/cron/fields/months";
import { Period } from "@desktop/components/cron/fields/period";
import { WeekDays } from "@desktop/components/cron/fields/week-days";
import { cn } from "@utils/class";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CronProps, Locale, PeriodType } from "./types";
import { usePrevious } from "./utils";

export function Cron(props: CronProps) {
  const { t } = useTranslation("cron");

  const locale = t("component", {
    returnObjects: true,
  }) as unknown as Locale;

  const {
    value = "",
    setValue,
    onError,
    className,
    defaultPeriod = "day",
    allowEmpty = "for-default-value",
    humanizeLabels = true,
    humanizeValue = false,
    disabled = false,
    readOnly = false,
    leadingZero = false,
    shortcuts = [
      "@yearly",
      "@annually",
      "@monthly",
      "@weekly",
      "@daily",
      "@midnight",
      "@hourly",
    ],
    periodicityOnDoubleClick = true,
    mode = "multiple",
    allowedDropdowns = [
      "period",
      "months",
      "month-days",
      "week-days",
      "hours",
      "minutes",
    ],
    allowedPeriods = [
      "year",
      "month",
      "week",
      "day",
      "hour",
      "minute",
      "reboot",
    ],
    allowClear,
    dropdownsConfig,
    getPopupContainer,
  } = props;
  const internalValueRef = useRef<string>(value);
  const defaultPeriodRef = useRef<PeriodType>(defaultPeriod);
  const [period, setPeriod] = useState<PeriodType | undefined>();
  const [monthDays, setMonthDays] = useState<number[] | undefined>();
  const [months, setMonths] = useState<number[] | undefined>();
  const [weekDays, setWeekDays] = useState<number[] | undefined>();
  const [hours, setHours] = useState<number[] | undefined>();
  const [minutes, setMinutes] = useState<number[] | undefined>();
  const [valueCleared, setValueCleared] = useState<boolean>(false);
  const previousValueCleared = usePrevious(valueCleared);

  useEffect(() => {
    setValuesFromCronString(
      value,
      () => {},
      onError,
      allowEmpty,
      internalValueRef,
      true,
      locale,
      shortcuts,
      setMinutes,
      setHours,
      setMonthDays,
      setMonths,
      setWeekDays,
      setPeriod,
    );
  }, [value, allowEmpty, shortcuts, locale]);

  useEffect(() => {
    if (value !== internalValueRef.current) {
      setValuesFromCronString(
        value,
        () => {},
        onError,
        allowEmpty,
        internalValueRef,
        false,
        locale,
        shortcuts,
        setMinutes,
        setHours,
        setMonthDays,
        setMonths,
        setWeekDays,
        setPeriod,
      );
    }
  }, [value, allowEmpty, shortcuts, locale]);

  useEffect(() => {
    // Only change the value if a user touched a field
    // and if the user didn't use the clear button
    if (
      (period || minutes || months || monthDays || weekDays || hours) &&
      !valueCleared &&
      !previousValueCleared
    ) {
      const selectedPeriod = period || defaultPeriodRef.current;
      const cron = getCronStringFromValues(
        selectedPeriod,
        months,
        monthDays,
        weekDays,
        hours,
        minutes,
        humanizeValue,
        dropdownsConfig,
      );

      setValue(cron, { selectedPeriod });
      internalValueRef.current = cron;

      if (onError) onError(undefined);
    } else if (valueCleared) {
      setValueCleared(false);
    }
  }, [
    period,
    monthDays,
    months,
    weekDays,
    hours,
    minutes,
    humanizeValue,
    valueCleared,
    dropdownsConfig,
  ]);

  const clockFormat = useMemo(() => {
    const date = new Date(Date.UTC(2020, 0, 1, 13, 0, 0)); // 1:00 PM UTC
    const formatted = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      hour12: undefined, // Let the system decide
    }).format(date);

    const hasAMPM = /AM|PM/i.test(formatted);
    return hasAMPM ? "12-hour-clock" : "24-hour-clock";
  }, []);

  const periodForRender = period || defaultPeriodRef.current;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {allowedDropdowns.includes("period") && (
        <Period
          value={periodForRender}
          setValue={(to) => {
            // This prevents the component from overriding
            // the period on mount.
            if (!to) return;
            setPeriod(to as PeriodType);
          }}
          locale={locale}
          disabled={dropdownsConfig?.period?.disabled ?? disabled}
          readOnly={dropdownsConfig?.period?.readOnly ?? readOnly}
          shortcuts={shortcuts}
          allowedPeriods={allowedPeriods}
          allowClear={dropdownsConfig?.period?.allowClear ?? allowClear}
          getPopupContainer={getPopupContainer}
        />
      )}

      <>
        {periodForRender === "year" && allowedDropdowns.includes("months") && (
          <Months
            value={months}
            setValue={setMonths}
            locale={locale}
            humanizeLabels={
              dropdownsConfig?.months?.humanizeLabels ?? humanizeLabels
            }
            disabled={dropdownsConfig?.months?.disabled ?? disabled}
            readOnly={dropdownsConfig?.months?.readOnly ?? readOnly}
            period={periodForRender}
            periodicityOnDoubleClick={
              dropdownsConfig?.months?.periodicityOnDoubleClick ??
              periodicityOnDoubleClick
            }
            mode={dropdownsConfig?.months?.mode ?? mode}
            allowClear={dropdownsConfig?.months?.allowClear ?? allowClear}
            filterOption={dropdownsConfig?.months?.filterOption}
            getPopupContainer={getPopupContainer}
          />
        )}

        {(periodForRender === "year" || periodForRender === "month") &&
          allowedDropdowns.includes("month-days") && (
            <MonthDays
              value={monthDays}
              setValue={setMonthDays}
              locale={locale}
              weekDays={weekDays}
              disabled={dropdownsConfig?.["month-days"]?.disabled ?? disabled}
              readOnly={dropdownsConfig?.["month-days"]?.readOnly ?? readOnly}
              leadingZero={
                dropdownsConfig?.["month-days"]?.leadingZero ?? leadingZero
              }
              period={periodForRender}
              periodicityOnDoubleClick={
                dropdownsConfig?.["month-days"]?.periodicityOnDoubleClick ??
                periodicityOnDoubleClick
              }
              mode={dropdownsConfig?.["month-days"]?.mode ?? mode}
              allowClear={
                dropdownsConfig?.["month-days"]?.allowClear ?? allowClear
              }
              filterOption={dropdownsConfig?.["month-days"]?.filterOption}
              getPopupContainer={getPopupContainer}
            />
          )}

        {(periodForRender === "year" ||
          periodForRender === "month" ||
          periodForRender === "week") &&
          allowedDropdowns.includes("week-days") && (
            <WeekDays
              value={weekDays}
              setValue={setWeekDays}
              locale={locale}
              humanizeLabels={
                dropdownsConfig?.["week-days"]?.humanizeLabels ?? humanizeLabels
              }
              monthDays={monthDays}
              disabled={dropdownsConfig?.["week-days"]?.disabled ?? disabled}
              readOnly={dropdownsConfig?.["week-days"]?.readOnly ?? readOnly}
              period={periodForRender}
              periodicityOnDoubleClick={
                dropdownsConfig?.["week-days"]?.periodicityOnDoubleClick ??
                periodicityOnDoubleClick
              }
              mode={dropdownsConfig?.["week-days"]?.mode ?? mode}
              allowClear={
                dropdownsConfig?.["week-days"]?.allowClear ?? allowClear
              }
              filterOption={dropdownsConfig?.["week-days"]?.filterOption}
              getPopupContainer={getPopupContainer}
            />
          )}

        <div className="flex gap-2">
          {periodForRender !== "minute" &&
            periodForRender !== "hour" &&
            allowedDropdowns.includes("hours") && (
              <Hours
                value={hours}
                setValue={setHours}
                locale={locale}
                disabled={dropdownsConfig?.hours?.disabled ?? disabled}
                readOnly={dropdownsConfig?.hours?.readOnly ?? readOnly}
                leadingZero={dropdownsConfig?.hours?.leadingZero ?? leadingZero}
                clockFormat={clockFormat}
                period={periodForRender}
                periodicityOnDoubleClick={
                  dropdownsConfig?.hours?.periodicityOnDoubleClick ??
                  periodicityOnDoubleClick
                }
                mode={dropdownsConfig?.hours?.mode ?? mode}
                allowClear={dropdownsConfig?.hours?.allowClear ?? allowClear}
                filterOption={dropdownsConfig?.hours?.filterOption}
                getPopupContainer={getPopupContainer}
              />
            )}

          {periodForRender !== "minute" &&
            allowedDropdowns.includes("minutes") && (
              <Minutes
                value={minutes}
                setValue={setMinutes}
                locale={locale}
                period={periodForRender}
                disabled={dropdownsConfig?.minutes?.disabled ?? disabled}
                readOnly={dropdownsConfig?.minutes?.readOnly ?? readOnly}
                leadingZero={
                  dropdownsConfig?.minutes?.leadingZero ?? leadingZero
                }
                clockFormat={clockFormat}
                periodicityOnDoubleClick={
                  dropdownsConfig?.minutes?.periodicityOnDoubleClick ??
                  periodicityOnDoubleClick
                }
                mode={dropdownsConfig?.minutes?.mode ?? mode}
                allowClear={dropdownsConfig?.minutes?.allowClear ?? allowClear}
                filterOption={dropdownsConfig?.minutes?.filterOption}
                getPopupContainer={getPopupContainer}
              />
            )}
        </div>
      </>
    </div>
  );
}
