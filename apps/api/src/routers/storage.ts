import { CustomError } from "@api/lib/error";
import { posthog } from "@api/lib/posthog";
import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { ZStorageOptionsType } from "@schemas/shared/storage";
import { ZHardDeleteStorage, ZSoftDeleteStorage } from "@schemas/storage";
import { logsnag } from "@utils/logsnag";
import { generateServiceToken } from "@utils/token";

export const storageRouter = router({
  list: authedProcedure.query(async ({ ctx }) => {
    let storages = await ctx.db
      .selectFrom("Storage")
      .select([
        "Storage.id",
        "Storage.version",
        "Storage.configLevel",
        "Storage.provider",
        "Storage.accountId",
        "Storage.options",
      ])
      .where("Storage.status", "=", "ACTIVE")
      .where("Storage.accountId", "=", ctx.account?.id!)
      .execute();

    const storagesWithToken: ((typeof storages)[number] & {
      token: string | null;
    })[] = [];

    for (const storage of storages) {
      let token: string | null = null;

      if (storage.provider === "BLINKDISK_CLOUD") {
        token = await generateServiceToken(
          {
            storageId: storage.id,
          },
          // The dotenv parser somtimes leaves a trailing backslash
          ctx.env.CLOUD_JWT_PRIVATE_KEY.replace(/\\+$/gm, ""),
        );
      }

      storagesWithToken.push({
        ...storage,
        token,
      });
    }

    return storagesWithToken as (Omit<
      (typeof storagesWithToken)[number],
      "options"
    > & {
      options: ZStorageOptionsType;
    })[];
  }),
  deleteHard: authedProcedure
    .input(ZHardDeleteStorage)
    .mutation(async ({ input, ctx }) => {
      const storage = await ctx.db
        .selectFrom("Storage")
        .select(["id", "provider"])
        .where("accountId", "=", ctx.account?.id!)
        .where("id", "=", input.storageId)
        .executeTakeFirst();

      if (!storage) throw new CustomError("STORAGE_NOT_FOUND");

      await Promise.all([
        ctx.db
          .deleteFrom("Vault")
          .where("storageId", "=", input.storageId)
          .execute(),
        ctx.db
          .deleteFrom("Config")
          .where("storageId", "=", input.storageId)
          .execute(),
        ctx.db
          .deleteFrom("Storage")
          .where("id", "=", input.storageId)
          .execute(),
      ]);

      if (storage.provider === "BLINKDISK_CLOUD") {
        const stub = ctx.env.STORAGE.getByName(input.storageId);
        await (stub as any).delete(input.storageId, true);
      }
    }),
  deleteSoft: authedProcedure
    .input(ZSoftDeleteStorage)
    .mutation(async ({ input, ctx }) => {
      const vault = await ctx.db
        .selectFrom("Vault")
        .innerJoin("Storage", "Storage.id", "Vault.storageId")
        .select([
          "Vault.id",
          "Vault.storageId",
          "Storage.provider",
          "Vault.name",
        ])
        .where("Vault.accountId", "=", ctx.account?.id!)
        .where("Vault.id", "=", input.vaultId)
        .executeTakeFirst();

      if (!vault) throw new CustomError("VAULT_NOT_FOUND");

      await Promise.all([
        ctx.db
          .updateTable("Vault")
          .set({ status: "DELETED" })
          .where("storageId", "=", vault.storageId)
          .execute(),
        ctx.db
          .updateTable("Storage")
          .set({ status: "DELETED" })
          .where("id", "=", vault.storageId)
          .execute(),
      ]);

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
        const stub = ctx.env.STORAGE.getByName(vault.storageId);
        await (stub as any).delete(vault.storageId, true);
      }
    }),
});
