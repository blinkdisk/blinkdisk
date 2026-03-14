import type { HonoContextOptions } from "@api/index";
import { getPolar } from "@api/lib/polar";
import type { Context } from "hono";
import type { BlankInput } from "hono/types";

export async function affiliateLink(
  c: Context<HonoContextOptions, "/affiliate/link", BlankInput>,
) {
  try {
    const { checkoutId, affiliateId } = await c.req.json();

    const polar = getPolar(c.env.POLAR_ENVIRONMENT, c.env.POLAR_TOKEN);

    const checkout = await polar.checkouts.get({
      id: checkoutId,
    });

    if (!checkout) return c.json({ error: "Checkout not found" }, 404);
    if (checkout.status !== "open")
      return c.json({ error: "Checkout closed" }, 400);

    await polar.checkouts.update({
      id: checkout.id,
      checkoutUpdate: {
        metadata: {
          ...(checkout.metadata || {}),
          affiliateId,
        },
      },
    });

    return c.json({ success: true }, 200);
  } catch (e) {
    console.error("Failed to link checkout:", e);
    return c.json({ error: "Internal server error" }, 500);
  }
}
