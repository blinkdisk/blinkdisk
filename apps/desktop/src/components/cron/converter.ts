import {
  CRON_PART_UNITS,
  CRON_UNITS,
  SHORTCUT_EXPRESSIONS,
} from "@desktop/components/cron/constants";
import type {
  ClockFormat,
  CronSchedule,
  CronUnit,
  Period,
} from "@desktop/components/cron/types";

type ScheduleField = keyof Omit<CronSchedule, "period">;

const FIELDS_BY_PERIOD: Record<Period, readonly ScheduleField[]> = {
  year: ["months", "monthDays", "weekDays", "hours", "minutes"],
  month: ["monthDays", "weekDays", "hours", "minutes"],
  week: ["weekDays", "hours", "minutes"],
  day: ["hours", "minutes"],
  hour: ["minutes"],
  minute: [],
};

export function parseCronExpression(expression: string): CronSchedule | null {
  const normalized = normalizeExpression(expression);
  if (!normalized) return null;

  const parts = normalized.split(" ");
  if (parts.length !== CRON_PART_UNITS.length) return null;

  try {
    const [minutes, hours, monthDays, months, weekDays] = parts.map(
      (part, index) => {
        const unit = CRON_PART_UNITS[index];
        if (!unit) throw new Error("Unknown cron unit");

        return parseCronPart(part, unit);
      },
    );

    if (!minutes || !hours || !monthDays || !months || !weekDays) return null;

    return {
      period: inferPeriod({ minutes, hours, monthDays, months, weekDays }),
      minutes,
      hours,
      monthDays,
      months,
      weekDays,
    };
  } catch {
    return null;
  }
}

export function formatCronExpression(schedule: CronSchedule) {
  return [
    formatCronPart(
      isPeriodField(schedule.period, "minutes") ? schedule.minutes : [],
      CRON_UNITS.minutes,
    ),
    formatCronPart(
      isPeriodField(schedule.period, "hours") ? schedule.hours : [],
      CRON_UNITS.hours,
    ),
    formatCronPart(
      isPeriodField(schedule.period, "monthDays") ? schedule.monthDays : [],
      CRON_UNITS.monthDays,
    ),
    formatCronPart(
      isPeriodField(schedule.period, "months") ? schedule.months : [],
      CRON_UNITS.months,
    ),
    formatCronPart(
      isPeriodField(schedule.period, "weekDays") ? schedule.weekDays : [],
      CRON_UNITS.weekDays,
    ),
  ].join(" ");
}

export function getCronStringFromValues(
  period: Period,
  months: number[] | undefined,
  monthDays: number[] | undefined,
  weekDays: number[] | undefined,
  hours: number[] | undefined,
  minutes: number[] | undefined,
) {
  return formatCronExpression({
    period,
    months: months ?? [],
    monthDays: monthDays ?? [],
    weekDays: weekDays ?? [],
    hours: hours ?? [],
    minutes: minutes ?? [],
  });
}

export function formatCronValue(
  value: number,
  unit: CronUnit,
  options: {
    labels?: readonly string[];
    clockFormat?: ClockFormat;
  } = {},
) {
  const label = options.labels?.[value - unit.min];
  if (label) return label;

  if (unit.id === "hours" && options.clockFormat === "12-hour-clock") {
    const suffix = value >= 12 ? "PM" : "AM";
    return `${value % 12 || 12}${suffix}`;
  }

  const shouldPad =
    options.clockFormat === "24-hour-clock" &&
    (unit.id === "hours" || unit.id === "minutes");

  return shouldPad ? value.toString().padStart(2, "0") : value.toString();
}

function normalizeExpression(expression: string) {
  const trimmed = expression.trim();
  if (!trimmed) return null;

  const shortcut =
    SHORTCUT_EXPRESSIONS[trimmed as keyof typeof SHORTCUT_EXPRESSIONS];

  return (shortcut ?? trimmed).replace(/\s+/g, " ");
}

function parseCronPart(part: string, unit: CronUnit) {
  if (part === "*" || part === "*/1") return [];

  const values = replaceLabels(part, unit)
    .split(",")
    .flatMap((segment) => parseCronSegment(segment, unit));

  const normalized = normalizeValues(values, unit);
  return normalized.length === getUnitSize(unit) ? [] : normalized;
}

function parseCronSegment(segment: string, unit: CronUnit) {
  const [rangePart, stepPart, extraPart] = segment.split("/");
  if (!rangePart || extraPart !== undefined) {
    throw new Error(`Invalid cron segment "${segment}"`);
  }

  const rangeValues =
    rangePart === "*" ? range(unit.min, unit.max) : parseRange(rangePart);
  const step = parseStep(stepPart);

  if (!step) return rangeValues;

  const first = rangeValues[0];
  if (first === undefined) return rangeValues;

  return rangeValues.filter(
    (value) => value === first || value % step === first % step,
  );
}

function parseRange(part: string) {
  const [startPart, endPart, extraPart] = part.split("-");
  if (!startPart || extraPart !== undefined) {
    throw new Error(`Invalid cron range "${part}"`);
  }

  const start = parseInteger(startPart);
  if (endPart === undefined) return [start];

  const end = parseInteger(endPart);
  if (end < start) throw new Error(`Invalid cron range "${part}"`);

  return range(start, end);
}

function parseStep(part: string | undefined) {
  if (part === undefined) return undefined;

  const step = parseInteger(part);
  if (step < 1) throw new Error(`Invalid cron step "${part}"`);

  return step;
}

function parseInteger(value: string) {
  if (!/^\d+$/.test(value)) throw new Error(`Invalid cron value "${value}"`);

  const number = Number(value);
  if (!Number.isInteger(number))
    throw new Error(`Invalid cron value "${value}"`);

  return number;
}

function replaceLabels(value: string, unit: CronUnit) {
  if (!unit.labels) return value;

  return value.toUpperCase().replace(/[A-Z]{3}/g, (label) => {
    const index = unit.labels?.indexOf(label) ?? -1;
    return index >= 0 ? String(unit.min + index) : label;
  });
}

function normalizeValues(values: number[], unit: CronUnit) {
  const normalized = values.map((value) =>
    unit.id === "week-days" && value === 7 ? 0 : value,
  );

  const outOfRange = normalized.find(
    (value) => value < unit.min || value > unit.max,
  );
  if (outOfRange !== undefined) {
    throw new Error(`Value "${outOfRange}" out of range for ${unit.id}`);
  }

  return [...new Set(normalized)].sort((left, right) => left - right);
}

function formatCronPart(values: number[], unit: CronUnit) {
  const normalized = normalizeValues(values, unit);
  if (normalized.length === 0 || normalized.length === getUnitSize(unit)) {
    return "*";
  }

  const step = getStep(normalized);
  if (step && isInterval(normalized, step)) {
    const start = getFirst(normalized);
    const end = getLast(normalized);
    const spansToUnitEnd = end + step > unit.max;

    if (start === unit.min && spansToUnitEnd) return `*/${step}`;

    return `${start}-${end}/${step}`;
  }

  return toRanges(normalized)
    .map((rangeValue) =>
      Array.isArray(rangeValue)
        ? `${rangeValue[0]}-${rangeValue[1]}`
        : String(rangeValue),
    )
    .join(",");
}

function inferPeriod(schedule: Omit<CronSchedule, "period">): Period {
  if (schedule.months.length > 0) return "year";
  if (schedule.monthDays.length > 0) return "month";
  if (schedule.weekDays.length > 0) return "week";
  if (schedule.hours.length > 0) return "day";
  if (schedule.minutes.length > 0) return "hour";

  return "minute";
}

function isPeriodField(
  period: Period,
  field: keyof Omit<CronSchedule, "period">,
) {
  return FIELDS_BY_PERIOD[period].includes(field);
}

function range(start: number, end: number) {
  const values: number[] = [];

  for (let value = start; value <= end; value += 1) {
    values.push(value);
  }

  return values;
}

function getUnitSize(unit: CronUnit) {
  return unit.max - unit.min + 1;
}

function getStep(values: number[]) {
  const first = values[0];
  const second = values[1];
  if (first === undefined || second === undefined) return undefined;

  const step = second - first;
  return step > 1 ? step : undefined;
}

function isInterval(values: number[], step: number) {
  for (let index = 1; index < values.length; index += 1) {
    const previous = values[index - 1];
    const current = values[index];
    if (previous === undefined || current === undefined) return false;
    if (current - previous !== step) return false;
  }

  return true;
}

function getFirst(values: number[]) {
  const value = values[0];
  if (value === undefined) throw new Error("Cannot read an empty cron field");

  return value;
}

function getLast(values: number[]) {
  const value = values[values.length - 1];
  if (value === undefined) throw new Error("Cannot read an empty cron field");

  return value;
}

function toRanges(values: number[]) {
  const ranges: ([number, number] | number)[] = [];
  let start: number | undefined;

  values.forEach((value, index) => {
    const next = values[index + 1];

    if (next === value + 1) {
      start ??= value;
      return;
    }

    if (start !== undefined) {
      ranges.push([start, value]);
      start = undefined;
      return;
    }

    ranges.push(value);
  });

  return ranges;
}
