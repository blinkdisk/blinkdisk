import { publicProcedure } from "@api/procedures/public";
import { TRPCError } from "@trpc/server";

export const authedProcedure = publicProcedure.use(async ({ next, ctx }) => {
  if (!ctx.account) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next();
});
