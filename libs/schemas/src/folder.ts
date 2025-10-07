import { z } from "zod";

export const ZFolderName = z.string().min(1).max(100);
export const ZFolderEmoji = z.string().emoji().min(1);

export const ZCreateFolderForm = z.object({
  name: ZFolderName,
  emoji: ZFolderEmoji,
  path: z.string().min(1),
});

export type ZCreateFolderFormType = z.infer<typeof ZCreateFolderForm>;
