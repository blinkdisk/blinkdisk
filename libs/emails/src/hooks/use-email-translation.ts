import email from "../../locales/en/email.json";

export type TranslationValue =
  | string
  | { [key: string]: string | TranslationValue };
export type Namespace = { [key: string]: TranslationValue };
export type Locale = { [namespace: string]: Namespace };
export type Locales = { [locale: string]: Locale };

export type LocaleProps = {
  locale: string;
  locales: Locales;
};

export function useEmailTranslation(
  {
    locales = {
      en: { email },
    },
    locale = "en",
  }: LocaleProps,
  prefix?: string,
) {
  function t(
    key: string,
    vars?: Record<string, string | number>,
    namespace = "email",
  ) {
    if (prefix) key = `${prefix}.${key}`;

    if (!locales[locale] || !locales[locale][namespace]) return key;

    const translation = getNestedTranslation(locales[locale][namespace], key);
    if (
      translation === undefined ||
      translation == null ||
      typeof translation !== "string"
    )
      return key;

    if (vars && typeof translation === "string") {
      let result = translation;

      Object.entries(vars).forEach(([k, value]) => {
        result = result.replace(`{{${k}}}`, value.toString());
      });

      return result;
    }

    return translation;
  }

  return { t };
}

function getNestedTranslation(
  obj: TranslationValue,
  key: string,
): TranslationValue | undefined {
  return key.split(".").reduce<TranslationValue | undefined>((acc, part) => {
    if (typeof acc === "object" && acc !== null && part in acc) {
      return (acc as { [key: string]: TranslationValue })[part];
    }
    return undefined;
  }, obj);
}
