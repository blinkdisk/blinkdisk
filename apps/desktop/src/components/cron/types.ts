export type CronProps = {
  value: string;
  setValue: (value: string, extra?: { selectedPeriod: Period }) => void;
  disabled?: boolean;
  className?: string;
};

export type Period = "year" | "month" | "week" | "day" | "hour" | "minute";

export type CronField =
  | "minutes"
  | "hours"
  | "monthDays"
  | "months"
  | "weekDays";

export type CronSchedule = {
  period: Period;
  minutes: number[];
  hours: number[];
  monthDays: number[];
  months: number[];
  weekDays: number[];
};

type CronUnitId = "minutes" | "hours" | "month-days" | "months" | "week-days";

export type CronUnit = {
  id: CronUnitId;
  min: number;
  max: number;
  labels?: readonly string[];
};

export type CronLocale = {
  emptyMonths?: string;
  emptyMonthDays?: string;
  emptyWeekDays?: string;
  emptyHours?: string;
  emptyMinutes?: string;
  emptyMinutesForHourPeriod?: string;
  yearOption?: string;
  monthOption?: string;
  weekOption?: string;
  dayOption?: string;
  hourOption?: string;
  minuteOption?: string;
  prefixPeriod?: string;
  prefixMonths?: string;
  prefixMonthDays?: string;
  prefixWeekDays?: string;
  prefixWeekDaysForMonthAndYearPeriod?: string;
  prefixHours?: string;
  prefixMinutes?: string;
  prefixMinutesForHourPeriod?: string;
  suffixMinutesForHourPeriod?: string;
  weekDays?: string[];
  months?: string[];
  altWeekDays?: string[];
  altMonths?: string[];
};

export type ResolvedCronLocale = Required<CronLocale>;

export type ClockFormat = "24-hour-clock" | "12-hour-clock";
