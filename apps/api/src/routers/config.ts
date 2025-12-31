import { CustomError } from "@api/lib/error";
import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { ZAddConfig, ZListConfigs } from "@schemas/config";
import { ZVaultEncryptedConfigType } from "@schemas/shared/vault";
import { generateId } from "@utils/id";

export const configRouter = router({
  list: authedProcedure.input(ZListConfigs).query(async ({ input, ctx }) => {
    let configs = await ctx.db
      .selectFrom("Config")
      .innerJoin("Storage", "Storage.id", "Config.storageId")
      .select([
        "Config.id",
        "Config.level",
        "Config.data",
        "Config.storageId",
        "Config.accountId",
        "Config.profileId",
      ])
      .where("Storage.status", "=", "ACTIVE")
      .where("Config.accountId", "=", ctx.account?.id!)
      .where(({ or, and, eb }) =>
        or([
          eb("Config.level", "=", "STORAGE"),
          and([
            eb("Config.level", "=", "PROFILE"),
            eb("Config.profileId", "=", input.profileId),
          ]),
        ]),
      )
      .execute();

    return configs as (Omit<(typeof configs)[number], "data"> & {
      data: ZVaultEncryptedConfigType;
    })[];
  }),
  add: authedProcedure.input(ZAddConfig).mutation(async ({ input, ctx }) => {
    const existing = await ctx.db
      .selectFrom("Config")
      .select(["id"])
      .where("level", "=", "PROFILE")
      .where("profileId", "=", input.profileId)
      .where("storageId", "=", input.storageId)
      .where("accountId", "=", ctx.account?.id!)
      .executeTakeFirst();

    if (existing) {
      await ctx.db.updateTable("Config").set({ data: input.config }).execute();
    } else {
      const storage = await ctx.db
        .selectFrom("Storage")
        .select(["id"])
        .where("accountId", "=", ctx.account?.id!)
        .where("id", "=", input.storageId)
        .executeTakeFirst();

      if (!storage) throw new CustomError("STORAGE_NOT_FOUND");

      const profile = await ctx.db
        .selectFrom("Profile")
        .select(["id"])
        .where("accountId", "=", ctx.account?.id!)
        .where("id", "=", input.profileId)
        .executeTakeFirst();

      if (!profile) throw new CustomError("PROFILE_NOT_FOUND");

      await ctx.db
        .insertInto("Config")
        .values({
          id: generateId("Config"),
          level: "PROFILE",
          data: input.config,
          profileId: input.profileId,
          storageId: input.storageId,
          accountId: ctx.account?.id!,
        })
        .execute();
    }
  }),
});
