import { auth } from "@api/auth";
import { createContext } from "@api/context";
import { ratelimit } from "@api/middlewares/limit";
import { appRouter } from "@api/router";
import { polarWebhook } from "@api/webhooks/polar";
import { PROTOCOL_FRONTEND_URL } from "@blinkdisk/constants/app";
import type { DB } from "@blinkdisk/db/index";
import { database } from "@blinkdisk/db/index";
import { trpcServer } from "@hono/trpc-server";
import * as Sentry from "@sentry/cloudflare";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Kysely } from "kysely";

export type HonoContextOptions = {
  Bindings: CloudflareBindings;
  Variables: {
    db: Kysely<DB>;
  };
};

const app = new Hono<HonoContextOptions>();

app.use(
  "*",
  cors({
    origin: (origin, c) => {
      if (c.env.DESKTOP_URL && origin === c.env.DESKTOP_URL)
        return c.env.DESKTOP_URL;
      if (c.env.WEB_URL && origin === c.env.WEB_URL) return c.env.WEB_URL;
      if (origin === PROTOCOL_FRONTEND_URL) return PROTOCOL_FRONTEND_URL;
      return null;
    },
    credentials: true,
  }),
);

app.use(ratelimit);

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.use(async (c, next) => {
  const db = database(c.env.HYPERDRIVE.connectionString);
  c.set("db", db);
  await next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth(c.env, c.get("db")).handler(c.req.raw);
});

app.post("/webhook/polar", polarWebhook);

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  }),
);

export default Sentry.withSentry(
  (env: CloudflareBindings) => ({
    dsn: env.SENTRY_API_DSN,
    sendDefaultPii: true,
    enabled: env.NODE_ENV !== "development",
  }),
  app,
);
