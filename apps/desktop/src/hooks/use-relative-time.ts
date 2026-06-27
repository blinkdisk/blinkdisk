import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { useCallback, useEffect, useState } from "react";

const RELATIVE_TIME_UNITS = [
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
  { unit: "second", ms: 1000 },
] as const;

function getRolloverThreshold(unitIndex: number) {
  const unit = RELATIVE_TIME_UNITS[unitIndex];
  const largerUnit = RELATIVE_TIME_UNITS[unitIndex - 1];

  if (!unit || !largerUnit) return Number.POSITIVE_INFINITY;
  if (largerUnit.unit === "year" && unit.unit === "month") return 12;

  return Math.ceil(largerUnit.ms / unit.ms);
}

export function formatRelativeTime(
  date: Date | string | number,
  language: string,
): string {
  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return "";

  const diff = timestamp - Date.now();
  const absDiff = Math.abs(diff);
  let unitIndex = RELATIVE_TIME_UNITS.findIndex(({ ms }) => absDiff >= ms);

  if (unitIndex === -1) unitIndex = RELATIVE_TIME_UNITS.length - 1;

  let selected = RELATIVE_TIME_UNITS[
    unitIndex
  ] as (typeof RELATIVE_TIME_UNITS)[number];
  let value = Math.round(diff / selected.ms);

  while (unitIndex > 0 && Math.abs(value) >= getRolloverThreshold(unitIndex)) {
    unitIndex -= 1;
    selected = RELATIVE_TIME_UNITS[
      unitIndex
    ] as (typeof RELATIVE_TIME_UNITS)[number];
    value = Math.round(diff / selected.ms);
  }

  return new Intl.RelativeTimeFormat(language, { numeric: "auto" }).format(
    value,
    selected.unit,
  );
}

export function useRelativeTime(
  date: Date | string | number | undefined | null,
): string {
  const { language } = useAppTranslation();

  const getRelativeTime = useCallback(
    () => (!date ? "" : formatRelativeTime(date, language)),
    [date, language],
  );

  const [relativeTime, setRelativeTime] = useState<string>(getRelativeTime);

  useEffect(() => {
    setRelativeTime(getRelativeTime());

    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime());
    }, 10_000);

    return () => clearInterval(interval);
  }, [getRelativeTime]);

  return relativeTime;
}
