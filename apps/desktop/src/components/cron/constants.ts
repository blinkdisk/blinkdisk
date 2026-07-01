import type { CronUnit, Period } from "@desktop/components/cron/types";

export const PERIODS = [
  "year",
  "month",
  "week",
  "day",
  "hour",
  "minute",
] as const satisfies readonly Period[];

export const CRON_UNITS = {
  minutes: {
    id: "minutes",
    min: 0,
    max: 59,
  },
  hours: {
    id: "hours",
    min: 0,
    max: 23,
  },
  monthDays: {
    id: "month-days",
    min: 1,
    max: 31,
  },
  months: {
    id: "months",
    min: 1,
    max: 12,
    labels: [
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
  },
  weekDays: {
    id: "week-days",
    min: 0,
    max: 6,
    labels: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
  },
} as const satisfies Record<string, CronUnit>;

export const CRON_PART_UNITS = [
  CRON_UNITS.minutes,
  CRON_UNITS.hours,
  CRON_UNITS.monthDays,
  CRON_UNITS.months,
  CRON_UNITS.weekDays,
] as const;

export const SHORTCUT_EXPRESSIONS = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
} as const;
