import { auth } from "@api/auth";
import { createContext } from "@api/context";
import { ratelimit } from "@api/middlewares/limit";
import { appRouter } from "@api/router";
import { polarWebhook } from "@api/webhooks/polar";
import { DB } from "@db";
import { database } from "@db/index";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Kysely } from "kysely";

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
      if (c.env.DESKTOP_URL && origin.startsWith(c.env.DESKTOP_URL))
        return c.env.DESKTOP_URL;
      return "blinkdiskapp://frontend";
    },
    credentials: true,
  }),
);

app.use(ratelimit);

app.use(async (c, next) => {
  const db = database(c.env.HYPERDRIVE.connectionString);
  c.set("db", db);
  await next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth(
    c.env.HYPERDRIVE.connectionString,
    c.env.SPACE,
    c.get("db"),
  ).handler(c.req.raw);
});

app.post("/webhook/polar", polarWebhook);

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  }),
);

export default app;
