import { enUS } from "date-fns/locale";
export const languageCodes = ["en"] as const;
export const defaultLanguageCode = "en";

export const languages = {
  en: {
    name: "English",
  },
};

export const dateLocales = {
  en: enUS,
} as const;

export type LanguageCode = (typeof languageCodes)[number];
