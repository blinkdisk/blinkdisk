import { z } from "zod";

export const ZAffiliateLinkCheckout = z.object({
  checkoutId: z.string(),
  affiliateId: z.string(),
});
