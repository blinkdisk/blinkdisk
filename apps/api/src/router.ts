import { configRouter } from "@api/routers/config";
import { deviceRouter } from "@api/routers/device";
import { folderRouter } from "@api/routers/folder";
import { paymentRouter } from "@api/routers/payment";
import { profileRouter } from "@api/routers/profile";
import { storageRouter } from "@api/routers/storage";
import { vaultRouter } from "@api/routers/vault";
import { router } from "@api/trpc";

export const appRouter = router({
  profile: profileRouter,
  device: deviceRouter,
  vault: vaultRouter,
  storage: storageRouter,
  config: configRouter,
  folder: folderRouter,
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;
