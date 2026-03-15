import { z } from "zod";

export const ZAffiliateLinkCheckout = z.object({
  checkoutId: z.string(),
  affiliateId: z.string(),
});

export type ZAffiliateLinkCheckoutType = z.infer<typeof ZAffiliateLinkCheckout>;

export const ZAffiliateTrack = z.object({
  referralId: z.string(),
});

export type ZAffiliateTrackType = z.infer<typeof ZAffiliateTrack>;
