import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { ZPushVaults } from "@blinkdisk/schemas/vault";
import { CustomError } from "@blinkdisk/utils/error";
import { verifyId } from "@blinkdisk/utils/id";

export const vaultRouter = router({
  pull: authedProcedure.query(async ({ ctx }) => {
    const rawVaults = await ctx.db
      .selectFrom("Vault")
      .selectAll()
      .where("accountId", "=", ctx.account.id)
      .execute();

    const vaults = rawVaults.map((vault) => {
      const { accountId, ...rest } = vault;
      return rest;
    });

    return { items: vaults };
  }),
  push: authedProcedure.input(ZPushVaults).mutation(async ({ input, ctx }) => {
    const currentVaults = await ctx.db
      .selectFrom("Vault")
      .select(["id"])
      .where("accountId", "=", ctx.account.id)
      .execute();

    const currentVaultIds = currentVaults.map((vault) => vault.id);

    const space = await ctx.db
      .selectFrom("Space")
      .select(["id"])
      .where("accountId", "=", ctx.account.id)
      .executeTakeFirst();

    if (!space) throw new CustomError("SPACE_NOT_FOUND");

    await ctx.db.transaction().execute(async (trx) => {
      for (const vault of input.added) {
        if (!verifyId(vault.id)) throw new CustomError("INCORRECT_VAULT");

        await trx
          .insertInto("Vault")
          .values({
            id: vault.id,
            coreId: vault.coreId,
            status: vault.status,
            name: vault.name,
            version: vault.version,
            provider: vault.provider,
            configLevel: vault.configLevel,
            options: vault.options,
            createdAt: vault.createdAt,
            accountId: ctx.account.id,
            ...(vault.spaceId ? { spaceId: space.id } : {}),
          })
          .execute();
      }

      for (const vault of input.modified) {
        if (!currentVaultIds.includes(vault.id))
          throw new CustomError("VAULT_NOT_FOUND");

        await trx
          .updateTable("Vault")
          .set({
            coreId: vault.coreId,
            status: vault.status,
            name: vault.name,
            version: vault.version,
            provider: vault.provider,
            configLevel: vault.configLevel,
            options: vault.options,
          })
          .where("id", "=", vault.id)
          .where("accountId", "=", ctx.account.id)
          .execute();
      }
    });
  }),
});
