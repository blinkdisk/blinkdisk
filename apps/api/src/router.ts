import { configRouter } from "@api/routers/config";
import { paymentRouter } from "@api/routers/payment";
import { profileRouter } from "@api/routers/profile";
import { vaultRouter } from "@api/routers/vault";
import { router } from "@api/trpc";

export const appRouter = router({
  vault: vaultRouter,
  config: configRouter,
  payment: paymentRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
