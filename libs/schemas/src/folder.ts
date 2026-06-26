import { z } from "zod";

const ZFolderName = z.string().min(1).max(100);
const ZFolderEmoji = z.emoji().min(1);

export const ZCreateFolderForm = z.object({
  name: ZFolderName,
  emoji: ZFolderEmoji.optional(),
  path: z.string().min(1),
});

export type ZCreateFolderFormType = z.infer<typeof ZCreateFolderForm>;
