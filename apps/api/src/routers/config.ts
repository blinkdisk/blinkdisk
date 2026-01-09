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
      .innerJoin("Vault", "Vault.id", "Config.vaultId")
      .select([
        "Config.id",
        "Config.level",
        "Config.data",
        "Config.vaultId",
        "Config.accountId",
      ])
      .where("Vault.status", "=", "ACTIVE")
      .where("Config.accountId", "=", ctx.account?.id!)
      .where(({ or, and, eb }) =>
        or([
          eb("Config.level", "=", "VAULT"),
          and([
            eb("Config.level", "=", "PROFILE"),
            eb("Config.userName", "=", input.userName),
            eb("Config.hostName", "=", input.hostName),
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
      .where("userName", "=", input.userName)
      .where("hostName", "=", input.hostName)
      .where("vaultId", "=", input.vaultId)
      .where("accountId", "=", ctx.account?.id!)
      .executeTakeFirst();

    if (existing) {
      await ctx.db.updateTable("Config").set({ data: input.config }).execute();
    } else {
      const vault = await ctx.db
        .selectFrom("Vault")
        .select(["id"])
        .where("accountId", "=", ctx.account?.id!)
        .where("id", "=", input.vaultId)
        .executeTakeFirst();

      if (!vault) throw new CustomError("VAULT_NOT_FOUND");

      await ctx.db
        .insertInto("Config")
        .values({
          id: generateId("Config"),
          level: "PROFILE",
          data: input.config,
          vaultId: input.vaultId,
          accountId: ctx.account?.id!,
          userName: input.userName,
          hostName: input.hostName,
        })
        .execute();
    }
  }),
});
