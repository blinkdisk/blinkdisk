import { startTrialWorkflow } from "@api/lib/workflows";
import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { TRIAL_DAYS, TRIAL_STORAGE } from "@blinkdisk/constants/space";
import { space, trial, vault } from "@blinkdisk/db/schema";
import {
  ZDeleteCloudBlinkVault,
  ZGetCloudBlinkToken,
} from "@blinkdisk/schemas/cloudblink";
import { CustomError } from "@blinkdisk/utils/error";
import { generateId } from "@blinkdisk/utils/id";
import { generateServiceToken } from "@blinkdisk/utils/token";
import { and, eq } from "drizzle-orm";

export const cloudblinkRouter = router({
  space: authedProcedure.query(async ({ ctx }) => {
    const spaceRows = await ctx.db
      .select({
        id: space.id,
        capacity: space.capacity,
        trialStartedAt: trial.startedAt,
        trialEndsAt: trial.endsAt,
      })
      .from(space)
      .leftJoin(trial, eq(trial.id, space.trialId))
      .where(eq(space.accountId, ctx.account.id))
      .limit(1);

    const accountSpace = spaceRows[0];
    if (!accountSpace) return null;

    const stub = ctx.env.SPACE.getByName(accountSpace.id);

    const used = await (
      stub as unknown as { getUsed: () => Promise<number> }
    ).getUsed();

    return {
      used,
      capacity: accountSpace.capacity,
      trialStartedAt: accountSpace.trialStartedAt,
      trialEndsAt: accountSpace.trialEndsAt,
    };
  }),
  initVault: authedProcedure.mutation(async ({ ctx }) => {
    const vaultId = generateId("Vault");

    const [accountSpace] = await ctx.db
      .select({ id: space.id, capacity: space.capacity })
      .from(space)
      .where(eq(space.accountId, ctx.account.id))
      .limit(1);

    let spaceId: string;

    if (accountSpace) {
      if (accountSpace.capacity === 0) throw new CustomError("NO_STORAGE");

      spaceId = accountSpace.id;
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

      await ctx.db.transaction(async (trx) => {
        await trx.insert(trial).values({
          id: trialId,
          capacity: TRIAL_STORAGE,
          accountId: ctx.account.id,
          startedAt,
          endsAt,
        });

        await trx.insert(space).values({
          id: spaceId,
          capacity: TRIAL_STORAGE,
          used: 0,
          accountId: ctx.account.id,
          trialId,
        });
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
      const [accountVault] = await ctx.db
        .select({
          id: vault.id,
          coreId: vault.coreId,
          name: vault.name,
          provider: vault.provider,
          version: vault.version,
          configLevel: vault.configLevel,
        })
        .from(vault)
        .where(
          and(eq(vault.accountId, ctx.account.id), eq(vault.id, input.vaultId)),
        )
        .limit(1);

      if (!accountVault) throw new CustomError("VAULT_NOT_FOUND");

      if (accountVault.provider !== "CLOUDBLINK")
        throw new CustomError("INCORRECT_VAULT");

      const token = await generateServiceToken(
        {
          vaultId: accountVault.id,
        },
        // The dotenv parser somtimes leaves a trailing backslash
        ctx.env.CLOUD_JWT_PRIVATE_KEY.replace(/\\+$/gm, ""),
      );

      return { token };
    }),
  deleteVault: authedProcedure
    .input(ZDeleteCloudBlinkVault)
    .mutation(async ({ input, ctx }) => {
      const [accountVault] = await ctx.db
        .select({
          id: vault.id,
          provider: vault.provider,
          name: vault.name,
        })
        .from(vault)
        .where(
          and(eq(vault.accountId, ctx.account.id), eq(vault.id, input.vaultId)),
        )
        .limit(1);

      if (!accountVault) {
        const accountId = await ctx.env.CACHE.get(`${input.vaultId}:accountId`);
        if (!accountId || accountId !== ctx.account.id)
          throw new CustomError("VAULT_NOT_FOUND");
      }

      if (accountVault && accountVault.provider !== "CLOUDBLINK")
        throw new CustomError("INCORRECT_VAULT");

      const stub = ctx.env.VAULT.getByName(input.vaultId);
      await (
        stub as unknown as {
          delete: (id: string, updateSpace: boolean) => Promise<void>;
        }
      ).delete(input.vaultId, true);
    }),
});
