import { CustomError } from "@api/lib/error";
import { posthog } from "@api/lib/posthog";
import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { providers } from "@config/providers";
import { defaultVaultOptions, LATEST_VAULT_VERSION } from "@config/vault";
import { ZVaultOptionsType } from "@schemas/shared/vault";
import {
  ZCreateVault,
  ZGetVault,
  ZHardDeleteVault,
  ZSoftDeleteVault,
  ZUpdateVault,
} from "@schemas/vault";
import { generateId } from "@utils/id";
import { logsnag } from "@utils/logsnag";
import { removeEmptyStrings } from "@utils/object";
import { generateServiceToken } from "@utils/token";

export const vaultRouter = router({
  create: authedProcedure
    .input(ZCreateVault)
    .mutation(async ({ input, ctx }) => {
      const vaultId = generateId("Vault");

      const provider = providers.find((p) => p.type === input.provider);
      if (!provider) throw new CustomError("PROVIDER_NOT_FOUND");

      const options = defaultVaultOptions;

      let spaceId: string | null = null;
      if (input.provider === "BLINKDISK_CLOUD") {
        const space = await ctx.db
          .selectFrom("Space")
          .select(["id"])
          .where("accountId", "=", ctx.account?.id!)
          .executeTakeFirst();

        if (!space) throw new CustomError("SPACE_NOT_FOUND");
        spaceId = space.id;
      }

      await ctx.db
        .insertInto("Vault")
        .values({
          id: vaultId,
          status: "ACTIVE",
          name: input.name,
          version: LATEST_VAULT_VERSION,
          provider: input.provider,
          accountId: ctx.account?.id!,
          configLevel: provider.level,
          passwordHash: input.passwordHash,
          options,
          ...(spaceId && { spaceId }),
        })
        .execute();

      const configId = generateId("Config");

      await ctx.db
        .insertInto("Config")
        .values({
          id: configId,
          level: provider.level,
          data: removeEmptyStrings(input.config),
          accountId: ctx.account?.id!,
          vaultId,
          ...(provider.level === "PROFILE" && {
            userName: input.userName,
            hostName: input.hostName,
          }),
        })
        .execute();

      let token: string | null = null;
      if (input.provider === "BLINKDISK_CLOUD" && spaceId) {
        token = await generateServiceToken(
          {
            vaultId,
          },
          // The dotenv parser somtimes leaves a trailing backslash
          ctx.env.CLOUD_JWT_PRIVATE_KEY.replace(/\\+$/gm, ""),
        );

        const stub = (ctx.env.VAULT as any).getByName(vaultId);
        await stub.init(spaceId);
      }

      ctx.waitUntil(
        (async () => {
          await logsnag({
            icon: "🔒",
            title: "Vault created",
            description: `(${input.provider}) ${input.name} just got created by ${ctx.account?.email}.`,
            channel: "vaults",
          });

          await posthog({
            distinctId: ctx.account?.id!,
            event: "vault_create",
            properties: {
              provider: input.provider,
              name: input.name,
              vaultId,
            },
          });
        })(),
      );

      return {
        vault: {
          id: vaultId,
          name: input.name,
          provider: input.provider,
          options,
          ...(token && { token }),
        },
      };
    }),
  list: authedProcedure.query(async ({ ctx }) => {
    let query = ctx.db
      .selectFrom("Vault")
      .select([
        "Vault.id",
        "Vault.name",
        "Vault.accountId",
        "Vault.options",
        "Vault.provider",
        "Vault.configLevel",
        "Vault.version",
      ])
      .where("Vault.status", "=", "ACTIVE")
      .where("Vault.accountId", "=", ctx.account?.id!);

    const vaults = await query.execute();

    const vaultsWithToken: ((typeof vaults)[number] & {
      token: string | null;
    })[] = [];

    for (const vault of vaults) {
      let token: string | null = null;

      if (vault.provider === "BLINKDISK_CLOUD") {
        token = await generateServiceToken(
          {
            vaultId: vault.id,
          },
          // The dotenv parser somtimes leaves a trailing backslash
          ctx.env.CLOUD_JWT_PRIVATE_KEY.replace(/\\+$/gm, ""),
        );
      }

      vaultsWithToken.push({
        ...vault,
        token,
      });
    }

    return vaultsWithToken as (Omit<
      (typeof vaultsWithToken)[number],
      "options"
    > & {
      options: ZVaultOptionsType;
    })[];
  }),
  get: authedProcedure.input(ZGetVault).query(async ({ input, ctx }) => {
    const vault = await ctx.db
      .selectFrom("Vault")
      .select([
        "Vault.id",
        "Vault.name",
        "Vault.provider",
        "Vault.passwordHash",
        "Vault.configLevel",
      ])
      .where("Vault.accountId", "=", ctx.account?.id!)
      .where("Vault.id", "=", input.vaultId)
      .executeTakeFirst();

    if (!vault) throw new CustomError("VAULT_NOT_FOUND");

    return vault;
  }),
  update: authedProcedure
    .input(ZUpdateVault)
    .mutation(async ({ ctx, input }) => {
      const vault = await ctx.db
        .selectFrom("Vault")
        .select(["id"])
        .where("id", "=", input.vaultId)
        .where("accountId", "=", ctx.account?.id!)
        .executeTakeFirst();

      if (!vault) throw new CustomError("VAULT_NOT_FOUND");

      await ctx.db
        .updateTable("Vault")
        .set({
          name: input.name,
        })
        .where("id", "=", vault.id)
        .execute();

      return vault;
    }),
  space: authedProcedure.query(async ({ ctx }) => {
    const space = await ctx.db
      .selectFrom("Space")
      .select(["id", "capacity"])
      .where("Space.accountId", "=", ctx.account?.id!)
      .executeTakeFirst();

    if (!space) throw new CustomError("SPACE_NOT_FOUND");

    const stub = (ctx.env.SPACE as any).getByName(space.id);
    const used = (await stub.getUsed()) as number;

    return {
      used,
      capacity: parseInt(space.capacity),
    };
  }),
  deleteHard: authedProcedure
    .input(ZHardDeleteVault)
    .mutation(async ({ input, ctx }) => {
      const vault = await ctx.db
        .selectFrom("Vault")
        .select(["id", "provider"])
        .where("accountId", "=", ctx.account?.id!)
        .where("id", "=", input.vaultId)
        .executeTakeFirst();

      if (!vault) throw new CustomError("VAULT_NOT_FOUND");

      await Promise.all([
        ctx.db.deleteFrom("Vault").where("id", "=", input.vaultId).execute(),
        ctx.db
          .deleteFrom("Config")
          .where("vaultId", "=", input.vaultId)
          .execute(),
      ]);

      if (vault.provider === "BLINKDISK_CLOUD") {
        const stub = ctx.env.VAULT.getByName(input.vaultId);
        await (stub as any).delete(input.vaultId, true);
      }
    }),
  deleteSoft: authedProcedure
    .input(ZSoftDeleteVault)
    .mutation(async ({ input, ctx }) => {
      const vault = await ctx.db
        .selectFrom("Vault")
        .select(["Vault.id", "Vault.provider", "Vault.name"])
        .where("Vault.accountId", "=", ctx.account?.id!)
        .where("Vault.id", "=", input.vaultId)
        .executeTakeFirst();

      if (!vault) throw new CustomError("VAULT_NOT_FOUND");

      await ctx.db
        .updateTable("Vault")
        .set({ status: "DELETED" })
        .where("id", "=", vault.id)
        .execute();

      ctx.waitUntil(
        (async () => {
          await logsnag({
            icon: "🗑",
            title: "Vault deleted",
            description: `(${vault.provider}) ${vault.name} just got deleted by ${ctx.account?.email}.`,
            channel: "vaults",
          });

          await posthog({
            distinctId: ctx.account?.id!,
            event: "vault_delete",
            properties: {
              provider: vault.provider,
              name: vault.name,
              vaultId: vault.id,
            },
          });
        })(),
      );

      if (vault.provider === "BLINKDISK_CLOUD") {
        const stub = ctx.env.VAULT.getByName(vault.id);
        await (stub as any).delete(vault.id, true);
      }
    }),
});
