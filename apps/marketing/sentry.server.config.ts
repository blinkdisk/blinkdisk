import * as Sentry from "@sentry/astro";
import { SENTRY_MARKETING_DSN } from "astro:env/client";

Sentry.init({
  dsn: SENTRY_MARKETING_DSN,
  sendDefaultPii: true,
  enabled: !import.meta.env.DEV,
});
