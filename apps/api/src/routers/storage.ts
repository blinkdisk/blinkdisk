import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import { ZStorageOptionsType } from "@schemas/shared/storage";
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
          ctx.env.JWT_PRIVATE_KEY,
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
});
