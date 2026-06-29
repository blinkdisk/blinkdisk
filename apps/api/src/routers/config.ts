import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { config as configTable, vault } from "@blinkdisk/db/schema";
import { ZPushConfigs } from "@blinkdisk/schemas/config";
import { CustomError } from "@blinkdisk/utils/error";
import { verifyId } from "@blinkdisk/utils/id";
import { and, eq } from "drizzle-orm";

export const configRouter = router({
  pull: authedProcedure.query(async ({ ctx }) => {
    const rawConfigs = await ctx.db
      .select()
      .from(configTable)
      .where(eq(configTable.accountId, ctx.account.id));

    const configs = rawConfigs.map((config) => {
      const { accountId, ...rest } = config;
      return rest;
    });

    return { items: configs };
  }),
  push: authedProcedure.input(ZPushConfigs).mutation(async ({ input, ctx }) => {
    const currentConfigs = await ctx.db
      .select({ id: configTable.id })
      .from(configTable)
      .where(eq(configTable.accountId, ctx.account.id));

    const currentConfigIds = currentConfigs.map((config) => config.id);

    const currentVaults = await ctx.db
      .select({ id: vault.id })
      .from(vault)
      .where(eq(vault.accountId, ctx.account.id));

    const currentVaultIds = currentVaults.map((vault) => vault.id);

    await ctx.db.transaction(async (trx) => {
      for (const config of input.added) {
        if (!verifyId(config.id)) throw new CustomError("INCORRECT_CONFIG");

        // Check that user has access to the vault
        if (!currentVaultIds.includes(config.vaultId))
          throw new CustomError("VAULT_NOT_FOUND");

        await trx.insert(configTable).values({
          id: config.id,
          data: config.data,
          level: config.level,
          vaultId: config.vaultId,
          createdAt: new Date(config.createdAt),
          accountId: ctx.account.id,
          ...(config.userName ? { userName: config.userName } : {}),
          ...(config.hostName ? { hostName: config.hostName } : {}),
        });
      }

      for (const config of input.modified) {
        if (!currentConfigIds.includes(config.id))
          throw new CustomError("CONFIG_NOT_FOUND");

        await trx
          .update(configTable)
          .set({
            data: config.data,
            level: config.level,
            userName: config.userName || null,
            hostName: config.hostName || null,
          })
          .where(
            and(
              eq(configTable.id, config.id),
              eq(configTable.accountId, ctx.account.id),
            ),
          );
      }
    });
  }),
});
