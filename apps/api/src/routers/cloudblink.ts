import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { ZGetVaultToken } from "@blinkdisk/schemas/vault";
import { CustomError } from "@blinkdisk/utils/error";
import { generateServiceToken } from "@blinkdisk/utils/token";

export const cloudblinkRouter = router({
  getVaultToken: authedProcedure
    .input(ZGetVaultToken)
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
});
