import { SENTRY_MARKETING_DSN } from "astro:env/client";
import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: SENTRY_MARKETING_DSN,
  sendDefaultPii: true,
  enabled: !import.meta.env.DEV,
});
