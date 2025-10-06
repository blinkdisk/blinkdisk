import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { ZCreateProfile, ZListProfiles } from "@schemas/profile";
import { generateId } from "@utils/id";

export const profileRouter = router({
  create: authedProcedure
    .input(ZCreateProfile)
    .mutation(async ({ input, ctx }) => {
      let device = await ctx.db
        .selectFrom("Device")
        .select(["id"])
        .where("machineId", "=", input.machineId)
        .where("accountId", "=", ctx.account?.id!)
        .executeTakeFirst();

      if (!device) {
        const id = generateId("Device");

        await ctx.db
          .insertInto("Device")
          .values({
            id,
            alias: input.hostName || input.machineId,
            hostName: input.hostName,
            machineId: input.machineId,
            accountId: ctx.account?.id!,
          })
          .execute();

        device = {
          id,
        };
      }

      let profile = await ctx.db
        .selectFrom("Profile")
        .select(["id"])
        .where("deviceId", "=", device.id)
        .where("accountId", "=", ctx.account?.id!)
        .where("userName", "=", input.userName)
        .executeTakeFirst();

      if (!profile) {
        const id = generateId("Profile");

        await ctx.db
          .insertInto("Profile")
          .values({
            id,
            alias: input.userName,
            userName: input.userName,
            deviceId: device.id,
            accountId: ctx.account?.id!,
          })
          .execute();

        profile = {
          id,
        };
      }

      return { deviceId: device.id, profileId: profile.id };
    }),
  list: authedProcedure.input(ZListProfiles).query(async ({ input, ctx }) => {
    let query = ctx.db
      .selectFrom("Profile")
      .select(["id", "alias", "userName", "deviceId"])
      .where("accountId", "=", ctx.account?.id!);

    if (input.deviceId) query = query.where("deviceId", "=", input.deviceId);

    const profiles = await query.execute();
    return profiles;
  }),
});
