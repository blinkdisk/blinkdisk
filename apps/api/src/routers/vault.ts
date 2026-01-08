import { CustomError } from "@api/lib/error";
import { posthog } from "@api/lib/posthog";
import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { providers } from "@config/providers";
import { defaultStorageOptions, LATEST_STORAGE_VERSION } from "@config/storage";
import type { EncryptedConfig } from "@electron/encryption";
import {
  ZCreateVault,
  ZGetVault,
  ZListVaults,
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
      const storageId = generateId("Storage");

      const profile = await ctx.db
        .selectFrom("Profile")
        .select(["id", "deviceId"])
        .where("accountId", "=", ctx.account?.id!)
        .where("id", "=", input.profileId)
        .executeTakeFirst();

      if (!profile) throw new CustomError("PROFILE_NOT_FOUND");

      const provider = providers.find((p) => p.type === input.provider);
      if (!provider) throw new CustomError("PROVIDER_NOT_FOUND");

      const options = defaultStorageOptions;

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
        .insertInto("Storage")
        .values({
          id: storageId,
          status: "ACTIVE",
          version: LATEST_STORAGE_VERSION,
          provider: input.provider,
          accountId: ctx.account?.id!,
          configLevel: provider.level,
          passwordHash: input.passwordHash,
          options,
          ...(spaceId && { spaceId }),
        })
        .execute();

      const vaultId = generateId("Vault");

      await ctx.db
        .insertInto("Vault")
        .values({
          id: vaultId,
          status: "ACTIVE",
          name: input.name,
          profileId: input.profileId,
          storageId: storageId,
          accountId: ctx.account?.id!,
        })
        .execute();

      const configId = generateId("Config");

      await ctx.db
        .insertInto("Config")
        .values({
          id: configId,
          level: provider.level,
          data: removeEmptyStrings(input.config),
          storageId: storageId,
          accountId: ctx.account?.id!,
          ...(provider.level === "PROFILE" && { profileId: input.profileId }),
        })
        .execute();

      let token: string | null = null;
      if (input.provider === "BLINKDISK_CLOUD" && spaceId) {
        token = await generateServiceToken(
          {
            storageId,
          },
          // The dotenv parser somtimes leaves a trailing backslash
          ctx.env.CLOUD_JWT_PRIVATE_KEY.replace(/\\+$/gm, ""),
        );

        const stub = (ctx.env.STORAGE as any).getByName(storageId);
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
              storageId,
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
        storageId: storageId,
        deviceId: profile.deviceId,
        profileId: input.profileId,
      };
    }),
  list: authedProcedure.input(ZListVaults).query(async ({ input, ctx }) => {
    let query = ctx.db
      .selectFrom("Vault")
      .innerJoin("Profile", "Profile.id", "Vault.profileId")
      .innerJoin("Storage", "Storage.id", "Vault.storageId")
      .select([
        "Vault.id",
        "Vault.name",
        "Vault.storageId",
        "Vault.profileId",
        "Vault.accountId",
        "Profile.deviceId",
        "Storage.options",
        "Storage.provider",
      ])
      .where("Vault.status", "=", "ACTIVE")
      .where("Vault.accountId", "=", ctx.account?.id!);

    if (input.profileId)
      query = query.where("Vault.profileId", "=", input.profileId);

    const vaults = await query.execute();
    return vaults;
  }),
  get: authedProcedure.input(ZGetVault).query(async ({ input, ctx }) => {
    const vault = await ctx.db
      .selectFrom("Vault")
      .innerJoin("Storage", "Storage.id", "Vault.storageId")
      .innerJoin("Profile", "Profile.id", "Vault.profileId")
      .select(({ selectFrom }) => [
        "Vault.id",
        "Vault.name",
        "Vault.storageId",
        "Profile.deviceId",
        "Vault.profileId",
        "Storage.provider",
        "Storage.passwordHash",
        selectFrom("Config")
          .whereRef("Config.storageId", "=", "Vault.storageId")
          .where(({ or, and, eb, ref }) =>
            or([
              eb("Config.level", "=", "STORAGE"),
              and([
                eb("Config.level", "=", "PROFILE"),
                eb("Config.profileId", "=", ref("Vault.profileId")),
              ]),
            ]),
          )
          .select("Config.data")
          .as("config"),
      ])
      .where("Vault.accountId", "=", ctx.account?.id!)
      .where("Vault.id", "=", input.vaultId)
      .executeTakeFirst();

    if (!vault) throw new CustomError("VAULT_NOT_FOUND");

    return vault as Omit<typeof vault, "config"> & {
      config: EncryptedConfig | null;
    };
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
});
