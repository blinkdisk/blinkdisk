import { startTrialWorkflow } from "@api/lib/workflows";
import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { TRIAL_DAYS, TRIAL_STORAGE } from "@blinkdisk/constants/space";
import {
  ZDeleteCloudBlinkVault,
  ZGetCloudBlinkToken,
} from "@blinkdisk/schemas/cloudblink";
import { CustomError } from "@blinkdisk/utils/error";
import { generateId } from "@blinkdisk/utils/id";
import { generateServiceToken } from "@blinkdisk/utils/token";

export const cloudblinkRouter = router({
  space: authedProcedure.query(async ({ ctx }) => {
    const space = await ctx.db
      .selectFrom("Space")
      .leftJoin("Trial", "Trial.id", "Space.trialId")
      .select([
        "Space.id as id",
        "Space.capacity as capacity",
        "Trial.endsAt as trialEndsAt",
      ])
      .where("Space.accountId", "=", ctx.account.id)
      .executeTakeFirst();

    if (!space) throw new CustomError("SPACE_NOT_FOUND");

    const stub = ctx.env.SPACE.getByName(space.id);

    const used = await (
      stub as unknown as { getUsed: () => Promise<number> }
    ).getUsed();

    return {
      used,
      capacity: parseInt(space.capacity, 10),
      trialEndsAt: space.trialEndsAt,
    };
  }),
  initVault: authedProcedure.mutation(async ({ ctx }) => {
    const vaultId = generateId("Vault");

    const space = await ctx.db
      .selectFrom("Space")
      .select(["id", "capacity"])
      .where("accountId", "=", ctx.account.id)
      .executeTakeFirst();

    let spaceId: string;

    if (space) {
      if (parseInt(space.capacity, 10) === 0)
        throw new CustomError("NO_STORAGE");

      spaceId = space.id;
    } else {
      spaceId = generateId("Space");
      const trialId = generateId("Trial");
      const startedAt = new Date();
      const endsAt = new Date(startedAt);
      endsAt.setDate(endsAt.getDate() + TRIAL_DAYS);

      const spaceStub = ctx.env.SPACE.getByName(spaceId);
      await (
        spaceStub as unknown as {
          init: (id: string, capacity: number) => Promise<void>;
        }
      ).init(spaceId, TRIAL_STORAGE);

      await ctx.db.transaction().execute(async (trx) => {
        await trx
          .insertInto("Trial")
          .values({
            id: trialId,
            capacity: TRIAL_STORAGE.toString(),
            accountId: ctx.account.id,
            startedAt,
            endsAt,
          })
          .execute();

        await trx
          .insertInto("Space")
          .values({
            id: spaceId,
            capacity: TRIAL_STORAGE.toString(),
            used: "0",
            accountId: ctx.account.id,
            trialId,
          })
          .execute();
      });

      await startTrialWorkflow(ctx.env, {
        trialId,
        endsAt: endsAt.toISOString(),
      });
    }

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
