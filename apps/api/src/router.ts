import { affiliateRouter } from "@api/routers/affiliate";
import { cloudblinkRouter } from "@api/routers/cloudblink";
import { configRouter } from "@api/routers/config";
import { paymentRouter } from "@api/routers/payment";
import { vaultRouter } from "@api/routers/vault";
import { router } from "@api/trpc";

export const appRouter = router({
  affiliate: affiliateRouter,
  vault: vaultRouter,
  config: configRouter,
  payment: paymentRouter,
  cloudblink: cloudblinkRouter,
});

export type AppRouter = typeof appRouter;
