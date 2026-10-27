import { SENTRY_MARKETING_DSN } from "astro:env/client";
import handler from "@astrojs/cloudflare/entrypoints/server";
import * as Sentry from "@sentry/cloudflare";

export default Sentry.withSentry(
  () => ({
    dsn: SENTRY_MARKETING_DSN,
    sendDefaultPii: true,
    beforeSend(event) {
      if (event.request?.url) {
        const url = new URL(event.request.url);
        if (url.pathname.startsWith("/blog/preview/")) {
          url.searchParams.delete("key");
          event.request.url = url.toString();
          event.request.cookies = undefined;
          if (event.request.headers) {
            for (const name of Object.keys(event.request.headers)) {
              if (["cookie", "authorization"].includes(name.toLowerCase()))
                delete event.request.headers[name];
            }
          }
        }
      }
      return event;
    },
    enabled: !import.meta.env.DEV,
  }),
  handler,
);
