import { z } from "zod";

export const ZCreateCheckout = z.object({
  priceId: z.string(),
});

export type ZCreateCheckoutType = z.infer<typeof ZCreateCheckout>;

export const ZChangePlan = z.object({
  priceId: z.string(),
});

export type ZChangePlan = z.infer<typeof ZCreateCheckout>;

export const ZChangePlanForm = z
  .object({ confirmed: z.boolean() })
  .refine((val) => !!val.confirmed, {
    message: "plan_change",
    path: ["confirmed"],
  });

export type ZChangePlanFormType = z.infer<typeof ZChangePlanForm>;
