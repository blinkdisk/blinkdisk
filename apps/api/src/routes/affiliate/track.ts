import type { HonoContextOptions } from "@api/index";
import axios from "axios";
import type { Context } from "hono";
import type { BlankInput } from "hono/types";

export async function affiliateTrack(
  c: Context<HonoContextOptions, "/affiliate/track", BlankInput>,
) {
  try {
    const { referralId } = await c.req.json();

    await axios.post(
      "https://app.endorsely.com/api/public/refer",
      {
        status: "Signed Up",
        referralId: referralId,
        organizationId: process.env.ENDORSELY_ORGANIZATION_ID,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ENDORSELY_PRIVATE_KEY}`,
        },
      },
    );

    return c.json({ success: true }, 200);
  } catch (e) {
    console.error("Failed to track affiliate referral:", e);
    return c.json({ error: "Internal server error" }, 500);
  }
}
