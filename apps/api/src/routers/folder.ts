import { CustomError } from "@api/lib/error";
import { posthog } from "@api/lib/posthog";
import { authedProcedure } from "@api/procedures/authed";
import { router } from "@api/trpc";
import {
  ZCreateFolder,
  ZDeleteFolder,
  ZListFolders,
  ZUpdateFolder,
} from "@schemas/folder";
import { generateId } from "@utils/id";
import { logsnag } from "@utils/logsnag";

export const folderRouter = router({
  list: authedProcedure.input(ZListFolders).query(async ({ input, ctx }) => {
    let folders = await ctx.db
      .selectFrom("Folder")
      .select(["id", "name", "emoji", "hash"])
      .where("accountId", "=", ctx.account?.id!)
      .where("vaultId", "=", input.vaultId)
      .execute();

    return folders;
  }),
  create: authedProcedure
    .input(ZCreateFolder)
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.db
        .selectFrom("Folder")
        .select(["id"])
        .where("hash", "=", input.hash)
        .where("vaultId", "=", input.vaultId)
        .where("accountId", "=", ctx.account?.id!)
        .executeTakeFirst();

      if (existing) {
        await ctx.db
          .updateTable("Folder")
          .set({
            name: input.name,
            emoji: input.emoji,
          })
          .where("id", "=", existing.id)
          .execute();
      } else {
        const vault = await ctx.db
          .selectFrom("Vault")
          .select(["id", "name"])
          .where("id", "=", input.vaultId)
          .where("accountId", "=", ctx.account?.id!)
          .executeTakeFirst();

        if (!vault) throw new CustomError("VAULT_NOT_FOUND");

        const id = generateId("Folder");

        await ctx.db
          .insertInto("Folder")
          .values({
            id,
            name: input.name,
            emoji: input.emoji,
            hash: input.hash,
            vaultId: input.vaultId,
            accountId: ctx.account?.id!,
          })
          .execute();

        ctx.waitUntil(
          (async () => {
            await logsnag({
              icon: "📁",
              title: "Folder added",
              description: `${input.emoji} ${input.name} just got added by ${ctx.account?.email}.`,
              channel: "folders",
            });

            await posthog({
              distinctId: ctx.account?.id!,
              event: "folder_add",
              properties: {
                name: input.name,
                emoji: input.emoji,
                vaultId: input.vaultId,
                folderId: id,
              },
            });
          })(),
        );

        return { id };
      }
    }),
  update: authedProcedure
    .input(ZUpdateFolder)
    .mutation(async ({ input, ctx }) => {
      const folder = await ctx.db
        .selectFrom("Folder")
        .select(["id"])
        .where("id", "=", input.folderId)
        .where("accountId", "=", ctx.account?.id!)
        .executeTakeFirst();

      if (!folder) throw new CustomError("FOLDER_NOT_FOUND");

      await ctx.db
        .updateTable("Folder")
        .set({
          name: input.name,
          emoji: input.emoji,
        })
        .where("id", "=", folder.id)
        .execute();
    }),
  delete: authedProcedure
    .input(ZDeleteFolder)
    .mutation(async ({ input, ctx }) => {
      const folder = await ctx.db
        .selectFrom("Folder")
        .select(["id"])
        .where("id", "=", input.folderId)
        .where("accountId", "=", ctx.account?.id!)
        .executeTakeFirst();

      if (!folder) throw new CustomError("FOLDER_NOT_FOUND");

      await ctx.db.deleteFrom("Folder").where("id", "=", folder.id).execute();
    }),
});
