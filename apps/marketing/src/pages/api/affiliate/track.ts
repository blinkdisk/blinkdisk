import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { referralId } = await request.json();

    if (!referralId || typeof referralId !== "string" || referralId.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid referralId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await fetch("https://app.endorsely.com/api/public/refer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.ENDORSELY_PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        status: "Signed Up",
        referralId,
        organizationId: import.meta.env.ENDORSELY_ORGANIZATION_ID,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Failed to track lead:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
