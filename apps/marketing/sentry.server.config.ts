import { SENTRY_MARKETING_DSN } from "astro:env/client";
import handler from "@astrojs/cloudflare/entrypoints/server";
import * as Sentry from "@sentry/cloudflare";

export default Sentry.withSentry(
  () => ({
    dsn: SENTRY_MARKETING_DSN,
    sendDefaultPii: true,
    enabled: !import.meta.env.DEV,
  }),
  handler,
);
