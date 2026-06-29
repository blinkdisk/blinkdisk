import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { space, vault as vaultTable } from "@blinkdisk/db/schema";
import { ZPushVaults } from "@blinkdisk/schemas/vault";
import { CustomError } from "@blinkdisk/utils/error";
import { verifyId } from "@blinkdisk/utils/id";
import { and, eq } from "drizzle-orm";

export const vaultRouter = router({
  pull: authedProcedure.query(async ({ ctx }) => {
    const rawVaults = await ctx.db
      .select()
      .from(vaultTable)
      .where(eq(vaultTable.accountId, ctx.account.id));

    const vaults = rawVaults.map((vault) => {
      const { accountId, ...rest } = vault;
      return rest;
    });

    return { items: vaults };
  }),
  push: authedProcedure.input(ZPushVaults).mutation(async ({ input, ctx }) => {
    const currentVaults = await ctx.db
      .select({ id: vaultTable.id })
      .from(vaultTable)
      .where(eq(vaultTable.accountId, ctx.account.id));

    const currentVaultIds = currentVaults.map((vault) => vault.id);

    const [accountSpace] = await ctx.db
      .select({ id: space.id })
      .from(space)
      .where(eq(space.accountId, ctx.account.id))
      .limit(1);

    if (!accountSpace) throw new CustomError("SPACE_NOT_FOUND");

    await ctx.db.transaction(async (trx) => {
      for (const vault of input.added) {
        if (!verifyId(vault.id)) throw new CustomError("INCORRECT_VAULT");

        await trx.insert(vaultTable).values({
          id: vault.id,
          coreId: vault.coreId,
          status: vault.status,
          name: vault.name,
          version: vault.version,
          provider: vault.provider,
          configLevel: vault.configLevel,
          options: vault.options,
          createdAt: new Date(vault.createdAt),
          accountId: ctx.account.id,
          ...(vault.spaceId ? { spaceId: accountSpace.id } : {}),
        });
      }

      for (const vault of input.modified) {
        if (!currentVaultIds.includes(vault.id))
          throw new CustomError("VAULT_NOT_FOUND");

        await trx
          .update(vaultTable)
          .set({
            coreId: vault.coreId,
            status: vault.status,
            name: vault.name,
            version: vault.version,
            provider: vault.provider,
            configLevel: vault.configLevel,
            options: vault.options,
          })
          .where(
            and(
              eq(vaultTable.id, vault.id),
              eq(vaultTable.accountId, ctx.account.id),
            ),
          );
      }
    });
  }),
});
