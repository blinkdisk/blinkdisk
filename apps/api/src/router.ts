import { configRouter } from "@api/routers/config";
import { paymentRouter } from "@api/routers/payment";
import { vaultRouter } from "@api/routers/vault";
import { router } from "@api/trpc";

export const appRouter = router({
  vault: vaultRouter,
  config: configRouter,
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;
