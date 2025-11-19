import { Polar } from "@polar-sh/sdk";
import { createServerFn } from "@tanstack/react-start";
import axios from "axios";
import { z } from "zod";

export const trackAffiliateLeadFn = createServerFn()
  .inputValidator(
    z.object({
      referralId: z.string().min(1).max(100),
    }),
  )
  .handler(async ({ data }) => {
    try {
      await axios.post(
        "https://app.endorsely.com/api/public/refer",
        {
          status: "Signed Up",
          referralId: data.referralId,
          organizationId: process.env.ENDORSELY_ORGANIZATION_ID,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.ENDORSELY_PRIVATE_KEY}`,
          },
        },
      );
    } catch (e) {
      console.error("Failed to track lead:", e);
    }
  });

export const linkAffiliateCheckoutFn = createServerFn()
  .inputValidator(
    z.object({
      checkoutId: z.string().min(1).max(100),
      affiliateId: z.string().min(1).max(100),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const polar = new Polar({
        server: process.env.POLAR_ENVIRONMENT as "production" | "sandbox",
        accessToken: process.env.POLAR_TOKEN!,
      });

      const checkout = await polar.checkouts.get({
        id: data.checkoutId,
      });

      if (!checkout) throw new Error("Checkout not found");
      if (checkout.status !== "open") throw new Error("Checkout not open");

      await polar.checkouts.update({
        id: checkout.id,
        checkoutUpdate: {
          metadata: {
            ...(checkout.metadata || {}),
            affiliateId: data.affiliateId,
          },
        },
      });
    } catch (e) {
      console.error("Failed to link checkout:", e);
    }
  });
