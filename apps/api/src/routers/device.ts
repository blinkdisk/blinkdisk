import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";

export const deviceRouter = router({
  list: authedProcedure.query(async ({ ctx }) => {
    const devices = await ctx.db
      .selectFrom("Device")
      .select(["id", "alias", "machineId"])
      .where("accountId", "=", ctx.account?.id!)
      .execute();

    return devices;
  }),
});
