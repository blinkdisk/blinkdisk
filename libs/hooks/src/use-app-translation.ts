import { useTranslation } from "@blinkdisk/utils/i18n";
import { useCallback } from "react";

export function useAppTranslation(defaultNS?: string) {
  const matches = (defaultNS ?? "").match(/^([\w-]+)\.(.+)?$/);
  const nested = matches?.[2] ?? undefined;

  const { t, i18n } = useTranslation(matches?.[1] || defaultNS);

  const translate = useCallback(
    (...args: Parameters<typeof t>) => {
      if (args[0].includes(":")) return t(...args) as string;
      else
        return t(
          (nested ? `${nested}.` : "") + args[0],
          // Don't have time to fix types here
          // eslint-disable-next-line
          args[1] as any,
        ) as string;
    },
    // i18n.language is required here to correctly update
    // the translations if the language state changes.
    // eslint-disable-next-line
    [i18n.language, nested, t],
  );

  return {
    t: translate,
    language: i18n.language,
  };
}
