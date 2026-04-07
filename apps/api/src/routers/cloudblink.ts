import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import {
  ZDeleteCloudBlinkVault,
  ZGetCloudBlinkToken,
} from "@blinkdisk/schemas/cloudblink";
import { CustomError } from "@blinkdisk/utils/error";
import { generateId } from "@blinkdisk/utils/id";
import { generateServiceToken } from "@blinkdisk/utils/token";

export const cloudblinkRouter = router({
  initVault: authedProcedure.mutation(async ({ ctx }) => {
    const vaultId = generateId("Vault");

    let spaceId: string | null = null;
    const space = await ctx.db
      .selectFrom("Space")
      .select(["id"])
      .where("accountId", "=", ctx.account.id)
      .executeTakeFirst();

    if (!space) throw new CustomError("SPACE_NOT_FOUND");
    spaceId = space.id;

    const token = await generateServiceToken(
      {
        vaultId,
      },
      // The dotenv parser somtimes leaves a trailing backslash
      ctx.env.CLOUD_JWT_PRIVATE_KEY.replace(/\\+$/gm, ""),
    );

    const stub = ctx.env.VAULT.getByName(vaultId);

    await (stub as unknown as { init: (id: string) => Promise<void> }).init(
      spaceId,
    );

    await ctx.env.CACHE.put(`${vaultId}:accountId`, ctx.account.id, {
      // Expire after 5 minutes
      expirationTtl: 300,
    });

    return {
      vaultId,
      spaceId,
      token,
    };
  }),
  getVaultToken: authedProcedure
    .input(ZGetCloudBlinkToken)
    .query(async ({ input, ctx }) => {
      const vault = await ctx.db
        .selectFrom("Vault")
        .select(["id", "coreId", "name", "provider", "version", "configLevel"])
        .where("accountId", "=", ctx.account.id)
        .where("id", "=", input.vaultId)
        .executeTakeFirst();

      if (!vault) throw new CustomError("VAULT_NOT_FOUND");

      if (vault.provider !== "CLOUDBLINK")
        throw new CustomError("INCORRECT_VAULT");

      const token = await generateServiceToken(
        {
          vaultId: vault.id,
        },
        // The dotenv parser somtimes leaves a trailing backslash
        ctx.env.CLOUD_JWT_PRIVATE_KEY.replace(/\\+$/gm, ""),
      );

      return { token };
    }),
  deleteVault: authedProcedure
    .input(ZDeleteCloudBlinkVault)
    .mutation(async ({ input, ctx }) => {
      const vault = await ctx.db
        .selectFrom("Vault")
        .select(["Vault.id", "Vault.provider", "Vault.name"])
        .where("Vault.accountId", "=", ctx.account.id)
        .where("Vault.id", "=", input.vaultId)
        .executeTakeFirst();

      if (!vault) {
        const accountId = await ctx.env.CACHE.get(`${input.vaultId}:accountId`);
        if (!accountId || accountId !== ctx.account.id)
          throw new CustomError("VAULT_NOT_FOUND");
      }

      if (vault && vault.provider !== "CLOUDBLINK")
        throw new CustomError("INCORRECT_VAULT");

      const stub = ctx.env.VAULT.getByName(input.vaultId);
      await (
        stub as unknown as {
          delete: (id: string, updateSpace: boolean) => Promise<void>;
        }
      ).delete(input.vaultId, true);
    }),
});
