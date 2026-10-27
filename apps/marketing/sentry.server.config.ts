import { SENTRY_MARKETING_DSN } from "astro:env/client";
import handler from "@astrojs/cloudflare/entrypoints/server";
import { redactPreviewRequest } from "@marketing/blog/redact-preview";
import * as Sentry from "@sentry/cloudflare";

export default Sentry.withSentry(
  () => ({
    dsn: SENTRY_MARKETING_DSN,
    sendDefaultPii: true,
    beforeSend: redactPreviewRequest,
    enabled: !import.meta.env.DEV,
  }),
  handler,
);
