export const languageCodes = ["en"] as const;
export const defaultLanguageCode = "en";

export const languages = {
  en: {
    name: "English",
  },
};

export type LanguageCode = (typeof languageCodes)[number];
