import { auth } from "@api/auth";
import type { HonoContextOptions } from "@api/index";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { Context as HonoContext } from "hono";

export const createContext = async (
  _: FetchCreateContextFnOptions,
  c: HonoContext<HonoContextOptions>,
) => {
  const session = await auth(
    c.env.HYPERDRIVE.connectionString,
    c.env.SPACE,
    c.get("db"),
  ).api.getSession({
    headers: c.req.raw.headers,
  });

  const waitUntil = c.executionCtx.waitUntil.bind(c.executionCtx);

  return {
    account: session?.user as NonNullable<typeof session>["user"],
    db: c.get("db"),
    waitUntil,
    req: c.req,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>> & {
  env: CloudflareBindings;
};
