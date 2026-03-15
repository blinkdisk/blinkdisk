import { defaultLanguageCode, languageCodes } from "@blinkdisk/config/language";
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
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    interpolation: {
      escapeValue: false,
    },
  });

export const dateLocales = {
  en: enUS,
} as const;

export default i18n;
