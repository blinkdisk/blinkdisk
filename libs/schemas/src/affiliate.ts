import { ZAnyExternalId } from "@schemas/shared/id";
import { z } from "zod";

export const ZAffiliateLinkCheckout = z.object({
  checkoutId: ZAnyExternalId,
  affiliateId: ZAnyExternalId,
});
