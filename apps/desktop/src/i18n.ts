import { defaultLanguageCode, languageCodes } from "@config/language";
import { enUS } from "date-fns/locale";
import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n
  .use(detector)
  .use(backend)
  .use(initReactI18next)
  .init({
    fallbackLng: defaultLanguageCode,
    supportedLngs: languageCodes,
    backend: {
      loadPath: "./locales/{{lng}}/{{ns}}.json",
    },
    interpolation: {
      escapeValue: false,
    },
  });

i18n.loadNamespaces([
  "error",
  "auth",
  "settings",
  "validation",
  "sidebar",
  "vault",
  "folder",
  "cron",
  "policy",
  "directory",
  "backup",
  "subscription",
  "update",
  "task",
]);

export const dateLocales = {
  en: enUS,
} as const;

export default i18n;
