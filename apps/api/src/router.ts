import { configRouter } from "#routers/config";
import { paymentRouter } from "#routers/payment";
import { profileRouter } from "#routers/profile";
import { vaultRouter } from "#routers/vault";
import { router } from "#trpc";

export const appRouter = router({
  vault: vaultRouter,
  config: configRouter,
  payment: paymentRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
