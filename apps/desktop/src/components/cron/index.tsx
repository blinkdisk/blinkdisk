// Modified from react-js-cron (MIT licensed)
// Original copyright (c) 2021 Xavier Rutayisire
// https://github.com/xrutayisire/react-js-cron

import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { cn } from "@blinkdisk/utils/class";
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
import type {
  CronProps,
  Locale,
  PeriodType,
  SetValueNumbersOrUndefined,
  SetValuePeriod,
  Shortcuts,
} from "@desktop/components/cron/types";
import { type SetStateAction, useEffect, useReducer } from "react";

type CronState = {
  period?: PeriodType;
  monthDays?: number[];
  months?: number[];
  weekDays?: number[];
  hours?: number[];
  minutes?: number[];
};

type NumberField = "monthDays" | "months" | "weekDays" | "hours" | "minutes";

type CronAction =
  | { type: "replace"; state: CronState }
  | { type: "period"; value: SetStateAction<PeriodType | undefined> }
  | {
      type: "number";
      field: NumberField;
      value: SetStateAction<number[] | undefined>;
    };

const DEFAULT_SHORTCUTS: Shortcuts = [
  "@yearly",
  "@annually",
  "@monthly",
  "@weekly",
  "@daily",
  "@midnight",
  "@hourly",
];

const CLOCK_FORMAT_SAMPLE_DATE = new Date(Date.UTC(2020, 0, 1, 13, 0, 0));
const CLOCK_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  hour12: undefined,
});
const CLOCK_FORMAT = /AM|PM/i.test(
  CLOCK_FORMATTER.format(CLOCK_FORMAT_SAMPLE_DATE),
)
  ? "12-hour-clock"
  : "24-hour-clock";

function resolveStateAction<T>(action: SetStateAction<T>, current: T) {
  return typeof action === "function"
    ? (action as (current: T) => T)(current)
    : action;
}

function cronReducer(state: CronState, action: CronAction): CronState {
  if (action.type === "replace") {
    return areCronStatesEqual(state, action.state) ? state : action.state;
  }

  if (action.type === "period") {
    return {
      ...state,
      period: resolveStateAction(action.value, state.period),
    };
  }

  return {
    ...state,
    [action.field]: resolveStateAction(action.value, state[action.field]),
  };
}

function areNumberArraysEqual(
  left: number[] | undefined,
  right: number[] | undefined,
) {
  if (left === right) return true;
  if (!left || !right) return false;
  if (left.length !== right.length) return false;

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }

  return true;
}

function areCronStatesEqual(left: CronState, right: CronState) {
  return (
    left.period === right.period &&
    areNumberArraysEqual(left.monthDays, right.monthDays) &&
    areNumberArraysEqual(left.months, right.months) &&
    areNumberArraysEqual(left.weekDays, right.weekDays) &&
    areNumberArraysEqual(left.hours, right.hours) &&
    areNumberArraysEqual(left.minutes, right.minutes)
  );
}

function getCronStateFromString({
  value,
  allowEmpty,
  firstRender,
  locale,
  shortcuts,
}: {
  value: string;
  allowEmpty: NonNullable<CronProps["allowEmpty"]>;
  firstRender: boolean;
  locale: Locale;
  shortcuts: Shortcuts;
}) {
  const state: CronState = {};
  const internalValueRef = { current: value };

  setValuesFromCronString(
    value,
    () => {},
    undefined,
    allowEmpty,
    internalValueRef,
    firstRender,
    locale,
    shortcuts,
    (next) => {
      state.minutes = resolveStateAction(next, state.minutes);
    },
    (next) => {
      state.hours = resolveStateAction(next, state.hours);
    },
    (next) => {
      state.monthDays = resolveStateAction(next, state.monthDays);
    },
    (next) => {
      state.months = resolveStateAction(next, state.months);
    },
    (next) => {
      state.weekDays = resolveStateAction(next, state.weekDays);
    },
    (next) => {
      state.period = resolveStateAction(next, state.period);
    },
  );

  return state;
}

function hasCronStateValue(state: CronState) {
  return !!(
    state.period ||
    state.minutes ||
    state.months ||
    state.monthDays ||
    state.weekDays ||
    state.hours
  );
}

export function Cron(props: CronProps) {
  const { t } = useAppTranslation("cron");

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
    shortcuts = DEFAULT_SHORTCUTS,
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
  const [state, dispatch] = useReducer(cronReducer, null, () =>
    getCronStateFromString({
      value,
      allowEmpty,
      firstRender: true,
      locale,
      shortcuts,
    }),
  );
  const { period, monthDays, months, weekDays, hours, minutes } = state;

  useEffect(() => {
    const parsed = getCronStateFromString({
      value,
      allowEmpty,
      firstRender: false,
      locale,
      shortcuts,
    });
    dispatch({ type: "replace", state: parsed });
  }, [value, allowEmpty, locale, shortcuts]);

  const applyState = (nextState: CronState) => {
    dispatch({ type: "replace", state: nextState });

    if (!hasCronStateValue(nextState)) return;

    const selectedPeriod = nextState.period || defaultPeriod;
    const cron = getCronStringFromValues(
      selectedPeriod,
      nextState.months,
      nextState.monthDays,
      nextState.weekDays,
      nextState.hours,
      nextState.minutes,
      humanizeValue,
      dropdownsConfig,
    );

    setValue(cron, { selectedPeriod });
    onError?.(undefined);
  };

  const setPeriod: SetValuePeriod = (next) => {
    const nextState = cronReducer(state, { type: "period", value: next });
    if (!nextState.period) return;
    applyState(nextState);
  };

  const setNumberField =
    (field: NumberField): SetValueNumbersOrUndefined =>
    (next) => {
      const nextState = cronReducer(state, {
        type: "number",
        field,
        value: next,
      });
      applyState(nextState);
    };

  const setMonthDays = setNumberField("monthDays");
  const setMonths = setNumberField("months");
  const setWeekDays = setNumberField("weekDays");
  const setHours = setNumberField("hours");
  const setMinutes = setNumberField("minutes");

  const periodForRender = period || defaultPeriod;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {allowedDropdowns.includes("period") && (
        <Period
          value={periodForRender}
          setValue={setPeriod}
          locale={locale}
          disabled={dropdownsConfig?.period?.disabled ?? disabled}
          readOnly={dropdownsConfig?.period?.readOnly ?? readOnly}
          shortcuts={shortcuts}
          allowedPeriods={allowedPeriods}
          allowClear={dropdownsConfig?.period?.allowClear ?? allowClear}
          getPopupContainer={getPopupContainer}
        />
      )}

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
              clockFormat={CLOCK_FORMAT}
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
              leadingZero={dropdownsConfig?.minutes?.leadingZero ?? leadingZero}
              clockFormat={CLOCK_FORMAT}
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
    </div>
  );
}
