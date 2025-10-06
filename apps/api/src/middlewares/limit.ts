import { Context, Next } from "hono";

export async function ratelimit(
  c: Context<{ Bindings: CloudflareBindings }>,
  next: Next,
) {
  const ip =
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for") ||
    c.req.header("x-client-ip");

  if (ip) {
    const { success } = await c.env.RATE_LIMIT.limit({
      key: ip,
    });

    if (!success)
      return c.json(
        {
          error: "Too many requests",
        },
        429,
      );
  }

  return next();
}
