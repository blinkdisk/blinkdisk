export const LANGUAGE_CODES = ["en"] as const;
export const DEFAULT_LANGUAGE_CODE = "en";

export const LANGUAGE_NAMES = {
  en: {
    name: "English",
  },
};

export type LanguageCode = (typeof LANGUAGE_CODES)[number];
