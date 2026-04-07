import { affiliateRouter } from "@api/routers/affiliate";
import { cloudblinkRouter } from "@api/routers/cloudblink";
import { paymentRouter } from "@api/routers/payment";
import { router } from "@api/trpc";

export const appRouter = router({
  affiliate: affiliateRouter,
  payment: paymentRouter,
  cloudblink: cloudblinkRouter,
});

export type AppRouter = typeof appRouter;
