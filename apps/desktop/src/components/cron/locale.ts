import type {
  CronLocale,
  ResolvedCronLocale,
} from "@desktop/components/cron/types";

const DEFAULT_LOCALE_EN = {
  emptyMonths: "every month",
  emptyMonthDays: "every day of the month",
  emptyWeekDays: "every day of the week",
  emptyHours: "every hour",
  emptyMinutes: "every minute",
  emptyMinutesForHourPeriod: "every",
  yearOption: "year",
  monthOption: "month",
  weekOption: "week",
  dayOption: "day",
  hourOption: "hour",
  minuteOption: "minute",
  prefixPeriod: "Every",
  prefixMonths: "in",
  prefixMonthDays: "on",
  prefixWeekDays: "on",
  prefixWeekDaysForMonthAndYearPeriod: "and",
  prefixHours: "at",
  prefixMinutes: ":",
  prefixMinutesForHourPeriod: "at",
  suffixMinutesForHourPeriod: "minute(s)",
  weekDays: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  altWeekDays: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
  altMonths: [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ],
} satisfies ResolvedCronLocale;

export function resolveCronLocale(locale: CronLocale): ResolvedCronLocale {
  return {
    ...DEFAULT_LOCALE_EN,
    ...locale,
    weekDays:
      locale.weekDays?.length === 7
        ? locale.weekDays
        : DEFAULT_LOCALE_EN.weekDays,
    months:
      locale.months?.length === 12 ? locale.months : DEFAULT_LOCALE_EN.months,
    altWeekDays:
      locale.altWeekDays?.length === 7
        ? locale.altWeekDays
        : DEFAULT_LOCALE_EN.altWeekDays,
    altMonths:
      locale.altMonths?.length === 12
        ? locale.altMonths
        : DEFAULT_LOCALE_EN.altMonths,
  };
}
