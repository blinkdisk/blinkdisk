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

function formatRelativeTime(
  date: Date | string | number,
  language: string,
): string {
  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return "";

  const diff = timestamp - Date.now();
  const absDiff = Math.abs(diff);
  const selected =
    RELATIVE_TIME_UNITS.find(({ ms }) => absDiff >= ms) ||
    RELATIVE_TIME_UNITS.at(-1);

  if (!selected) return "";

  return new Intl.RelativeTimeFormat(language, { numeric: "auto" }).format(
    Math.round(diff / selected.ms),
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
