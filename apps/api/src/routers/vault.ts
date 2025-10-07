import { CustomError } from "@api/lib/error";
import { posthog } from "@api/lib/posthog";
import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { providers } from "@config/providers";
import { defaultStorageOptions, LATEST_STORAGE_VERSION } from "@config/storage";
import type { EncryptedConfig } from "@electron/encryption";
import {
  ZCreateVault,
  ZDeleteVault,
  ZGetVault,
  ZLinkVault,
  ZListUnlinkedVaults,
  ZListVaults,
  ZUpdateVault,
  ZVaultSpace,
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
          ctx.env.JWT_PRIVATE_KEY,
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
  listUnlinked: authedProcedure
    .input(ZListUnlinkedVaults)
    .query(async ({ input, ctx }) => {
      const vaults = await ctx.db
        .selectFrom("Vault")
        .innerJoin("Storage", "Storage.id", "Vault.storageId")
        .innerJoin("Profile", "Profile.id", "Vault.profileId")
        .innerJoin("Device", "Device.id", "Profile.deviceId")
        .leftJoin("Config", (join) =>
          join
            .onRef("Config.storageId", "=", "Vault.storageId")
            .onRef("Vault.profileId", "=", "Config.profileId"),
        )
        .select(({ selectFrom }) => [
          "Vault.id",
          "Vault.name",
          "Vault.storageId",
          "Vault.profileId",
          "Profile.deviceId",
          "Storage.provider",
          "Storage.passwordHash",
          "Storage.configLevel",
          "Device.alias as deviceAlias",
          "Profile.alias as profileAlias",
          selectFrom("Config")
            .whereRef("Config.storageId", "=", "Vault.storageId")
            .where(({ or, and, eb }) =>
              or([
                eb("Config.level", "=", "STORAGE"),
                and([
                  eb("Config.level", "=", "PROFILE"),
                  eb("Config.profileId", "=", input.profileId),
                ]),
              ]),
            )
            .select("Config.data")
            .as("config"),
        ])
        .where("Vault.status", "=", "ACTIVE")
        .where("Vault.accountId", "=", ctx.account?.id!)
        .where("Vault.storageId", "not in", ({ selectFrom }) =>
          selectFrom("Storage")
            .innerJoin("Vault", (join) =>
              join
                .onRef("Vault.storageId", "=", "Storage.id")
                .on("Vault.profileId", "=", input.profileId),
            )
            .select("Storage.id")
            .where("Storage.accountId", "=", ctx.account?.id!),
        )
        .execute();

      return vaults as (Omit<(typeof vaults)[number], "config"> & {
        config: EncryptedConfig | null;
      })[];
    }),
  link: authedProcedure.input(ZLinkVault).mutation(async ({ input, ctx }) => {
    const storage = await ctx.db
      .selectFrom("Storage")
      .select(["id", "provider", "configLevel"])
      .where("accountId", "=", ctx.account?.id!)
      .where("id", "=", input.storageId)
      .executeTakeFirst();

    if (!storage) throw new CustomError("STORAGE_NOT_FOUND");
    if (storage.configLevel === "PROFILE" && !input.config)
      throw new CustomError("CONFIG_REQUIRED");

    const profile = await ctx.db
      .selectFrom("Profile")
      .select(["id"])
      .where("accountId", "=", ctx.account?.id!)
      .where("id", "=", input.profileId)
      .executeTakeFirst();

    if (!profile) throw new CustomError("PROFILE_NOT_FOUND");

    const vault = await ctx.db
      .selectFrom("Vault")
      .select(["id"])
      .where("profileId", "=", input.profileId)
      .where("storageId", "=", input.storageId)
      .executeTakeFirst();

    if (vault) throw new CustomError("VAULT_ALREADY_LINKED");

    const vaultId = generateId("Vault");

    await ctx.db
      .insertInto("Vault")
      .values({
        id: vaultId,
        status: "ACTIVE",
        name: input.name,
        profileId: input.profileId,
        storageId: input.storageId,
        accountId: ctx.account?.id!,
      })
      .execute();

    const configId = generateId("Config");

    if (storage.configLevel === "PROFILE") {
      await ctx.db
        .insertInto("Config")
        .values({
          id: configId,
          level: "PROFILE",
          data: removeEmptyStrings(input.config),
          profileId: input.profileId,
          storageId: input.storageId,
          accountId: ctx.account?.id!,
        })
        .execute();
    }

    ctx.waitUntil(
      (async () => {
        await logsnag({
          icon: "🔗",
          title: "Vault linked",
          description: `(${storage.provider}) ${input.name} just got linked by ${ctx.account?.email}.`,
          channel: "vaults",
        });

        await posthog({
          distinctId: ctx.account?.id!,
          event: "vault_link",
          properties: {
            provider: storage.provider,
            name: input.name,
            storageId: storage.id,
            vaultId,
          },
        });
      })(),
    );

    return {
      vaultId,
      storageId: storage.id,
      provider: storage.provider,
    };
  }),
  delete: authedProcedure
    .input(ZDeleteVault)
    .mutation(async ({ input, ctx }) => {
      const vault = await ctx.db
        .selectFrom("Vault")
        .select(["id", "storageId"])
        .where("accountId", "=", ctx.account?.id!)
        .where("id", "=", input.vaultId)
        .executeTakeFirst();

      if (!vault) throw new CustomError("VAULT_NOT_FOUND");

      await ctx.db
        .deleteFrom("Vault")
        .where("id", "=", input.vaultId)
        .execute();

      const vaults = await ctx.db
        .selectFrom("Vault")
        .select(["id"])
        .where("storageId", "=", vault.storageId)
        .execute();

      if (!vaults.length) {
        await ctx.db
          .deleteFrom("Config")
          .where("storageId", "=", vault.storageId)
          .execute();

        await ctx.db
          .deleteFrom("Storage")
          .where("id", "=", vault.storageId)
          .execute();
      }
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
      .select(({ selectFrom }) => [
        "Vault.id",
        "Vault.name",
        "Vault.storageId",
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
  space: authedProcedure.input(ZVaultSpace).query(async ({ input, ctx }) => {
    const space = await ctx.db
      .selectFrom("Vault")
      .innerJoin("Storage", "Storage.id", "Vault.storageId")
      .innerJoin("Space", "Space.id", "Storage.spaceId")
      .select(["Space.id", "Space.capacity"])
      .where("Vault.accountId", "=", ctx.account?.id!)
      .where("Vault.id", "=", input.vaultId)
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
