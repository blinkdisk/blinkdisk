import { z } from "zod";

export const ZFolderName = z.string().min(1).max(100);
export const ZFolderEmoji = z.string().emoji().min(1);
export const ZFolderType = z.enum(["file", "folder"]);

export const ZCreateFolderForm = z.object({
  name: ZFolderName,
  emoji: ZFolderEmoji,
  path: z.string().min(1),
  type: ZFolderType,
});

export type ZCreateFolderFormType = z.infer<typeof ZCreateFolderForm>;
export type ZFolderTypeType = z.infer<typeof ZFolderType>;
