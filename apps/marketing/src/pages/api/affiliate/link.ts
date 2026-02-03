import type { APIRoute } from "astro";
import { Polar } from "@polar-sh/sdk";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { checkoutId, affiliateId } = await request.json();

    if (!checkoutId || typeof checkoutId !== "string" || checkoutId.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid checkoutId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!affiliateId || typeof affiliateId !== "string" || affiliateId.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid affiliateId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const polar = new Polar({
      server: import.meta.env.POLAR_ENVIRONMENT as "production" | "sandbox",
      accessToken: import.meta.env.POLAR_TOKEN!,
    });

    const checkout = await polar.checkouts.get({
      id: checkoutId,
    });

    if (!checkout) {
      return new Response(JSON.stringify({ error: "Checkout not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (checkout.status !== "open") {
      return new Response(JSON.stringify({ error: "Checkout not open" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await polar.checkouts.update({
      id: checkout.id,
      checkoutUpdate: {
        metadata: {
          ...(checkout.metadata || {}),
          affiliateId,
        },
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Failed to link checkout:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
