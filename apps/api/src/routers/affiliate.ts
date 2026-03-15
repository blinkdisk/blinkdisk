import { getPolar } from "@api/lib/polar";
import { publicProcedure } from "@api/procedures/public";
import { router } from "@api/trpc";
import {
  ZAffiliateLinkCheckout,
  ZAffiliateTrack,
} from "@blinkdisk/schemas/affiliate";
import axios from "axios";

export const affiliateRouter = router({
  linkCheckout: publicProcedure
    .input(ZAffiliateLinkCheckout)
    .mutation(async ({ input, ctx }) => {
      const polar = getPolar(ctx.env.POLAR_ENVIRONMENT, ctx.env.POLAR_TOKEN);

      const checkout = await polar.checkouts.get({
        id: input.checkoutId,
      });

      if (!checkout) throw new Error("Checkout not found");
      if (checkout.status !== "open") throw new Error("Checkout closed");

      await polar.checkouts.update({
        id: checkout.id,
        checkoutUpdate: {
          metadata: {
            ...(checkout.metadata || {}),
            affiliateId: input.affiliateId,
          },
        },
      });

      return { success: true };
    }),
  track: publicProcedure
    .input(ZAffiliateTrack)
    .mutation(async ({ input, ctx }) => {
      await axios.post(
        "https://app.endorsely.com/api/public/refer",
        {
          status: "Signed Up",
          referralId: input.referralId,
          organizationId: ctx.env.ENDORSELY_ORGANIZATION_ID,
        },
        {
          headers: {
            Authorization: `Bearer ${ctx.env.ENDORSELY_PRIVATE_KEY}`,
          },
        },
      );

      return { success: true };
    }),
});
