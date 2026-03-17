import { LANGUAGE_DATE_LOCALES } from "@blinkdisk/config/language";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { formatDistanceToNow } from "date-fns";
import { useCallback, useEffect, useState } from "react";

export function useRelativeTime(
  date: Date | string | number | undefined | null,
): string {
  const { language } = useAppTranslation();

  const getRelativeTime = useCallback(
    () =>
      !date
        ? ""
        : formatDistanceToNow(new Date(date), {
            addSuffix: true,
            ...(language in LANGUAGE_DATE_LOCALES
              ? {
                  locale:
                    LANGUAGE_DATE_LOCALES[
                      language as keyof typeof LANGUAGE_DATE_LOCALES
                    ],
                }
              : {}),
          }),
    [date, language],
  );

  const [relativeTime, setRelativeTime] = useState<string>(getRelativeTime);

  useEffect(() => {
    setRelativeTime(getRelativeTime());

    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime());
    }, 10_000);

    return () => clearInterval(interval);
  }, [date, getRelativeTime]);

  return relativeTime;
}
