import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { jsonArrayFrom } from "@db/index";

export const profileRouter = router({
  listLegacy: authedProcedure.query(async ({ ctx }) => {
    const profiles = await ctx.db
      .selectFrom("LegacyDevice")
      .select((eb) => [
        "id",
        "hostName",
        jsonArrayFrom(
          eb
            .selectFrom("LegacyProfile")
            .select(["LegacyProfile.id", "LegacyProfile.userName"])
            .whereRef("LegacyProfile.deviceId", "=", "LegacyDevice.id"),
        ).as("userNames"),
      ])
      .where("accountId", "=", ctx.account?.id!)
      .execute();

    return profiles;
  }),
});
