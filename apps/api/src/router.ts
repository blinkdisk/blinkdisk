import { affiliateRouter } from "@api/routers/affiliate";
import { cloudblinkRouter } from "@api/routers/cloudblink";
import { configRouter } from "@api/routers/config";
import { paymentRouter } from "@api/routers/payment";
import { vaultRouter } from "@api/routers/vault";
import { router } from "@api/trpc";

export const appRouter = router({
  affiliate: affiliateRouter,
  payment: paymentRouter,
  cloudblink: cloudblinkRouter,
  vault: vaultRouter,
  config: configRouter,
});

export type AppRouter = typeof appRouter;
