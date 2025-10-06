import { useCallback } from "react";
import { useTranslation } from "react-i18next";

export function useAppTranslation(defaultNS?: string) {
  const matches = (defaultNS ?? "").match(/^([\w-]+)\.(.+)?$/);
  const nested = matches?.[2] ?? undefined;

  const { t, i18n } = useTranslation(matches?.[1] || defaultNS);

  const translate = useCallback(
    (str: string, query?: Record<string, string | number>) => {
      if (str.includes(":")) return t(str, query);
      else return t((nested ? `${nested}.` : "") + str, query);
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
