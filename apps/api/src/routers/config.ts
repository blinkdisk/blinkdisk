import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { ZPushConfigs } from "@blinkdisk/schemas/config";
import { CustomError } from "@blinkdisk/utils/error";
import { verifyId } from "@blinkdisk/utils/id";

export const configRouter = router({
  pull: authedProcedure.query(async ({ ctx }) => {
    const rawConfigs = await ctx.db
      .selectFrom("Config")
      .selectAll()
      .where("accountId", "=", ctx.account.id)
      .execute();

    const configs = rawConfigs.map((config) => {
      const { accountId, ...rest } = config;
      return rest;
    });

    return { items: configs };
  }),
  push: authedProcedure.input(ZPushConfigs).mutation(async ({ input, ctx }) => {
    const currentConfigs = await ctx.db
      .selectFrom("Config")
      .select(["id"])
      .where("accountId", "=", ctx.account.id)
      .execute();

    const currentConfigIds = currentConfigs.map((config) => config.id);

    const currentVaults = await ctx.db
      .selectFrom("Vault")
      .select(["id"])
      .where("accountId", "=", ctx.account.id)
      .execute();

    const currentVaultIds = currentVaults.map((vault) => vault.id);

    await ctx.db.transaction().execute(async (trx) => {
      for (const config of input.added) {
        if (!verifyId(config.id)) throw new CustomError("INCORRECT_CONFIG");

        // Check that user has access to the vault
        if (!currentVaultIds.includes(config.vaultId))
          throw new CustomError("VAULT_NOT_FOUND");

        await trx
          .insertInto("Config")
          .values({
            id: config.id,
            data: config.data,
            level: config.level,
            vaultId: config.vaultId,
            createdAt: config.createdAt,
            accountId: ctx.account.id,
            ...(config.userName ? { userName: config.userName } : {}),
            ...(config.hostName ? { hostName: config.hostName } : {}),
          })
          .execute();
      }

      for (const config of input.modified) {
        if (!currentConfigIds.includes(config.id))
          throw new CustomError("CONFIG_NOT_FOUND");

        await trx
          .updateTable("Config")
          .set({
            data: config.data,
            level: config.level,
            userName: config.userName || null,
            hostName: config.hostName || null,
          })
          .where("id", "=", config.id)
          .where("accountId", "=", ctx.account.id)
          .execute();
      }
    });
  }),
});
