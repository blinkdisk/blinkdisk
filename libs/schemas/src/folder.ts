import { z } from "zod";

const ZFolderName = z.string().min(1).max(100);
const ZFolderEmoji = z.string().emoji().min(1);

export const ZListFolders = z.object({
  vaultId: z.string(),
});

export type ZListFoldersType = z.infer<typeof ZListFolders>;

const ZCreateFolderBase = {
  name: ZFolderName,
  emoji: ZFolderEmoji,
};

export const ZCreateFolder = z.object({
  ...ZCreateFolderBase,
  vaultId: z.string(),
  hash: z.string(),
});

export type ZCreateFolderType = z.infer<typeof ZCreateFolder>;

export const ZCreateFolderForm = z.object({
  ...ZCreateFolderBase,
  path: z.string().min(1),
});

export type ZCreateFolderFormType = z.infer<typeof ZCreateFolderForm>;

const ZUpdateFolderBase = {
  name: ZFolderName,
  emoji: ZFolderEmoji,
};

export const ZUpdateFolder = z.object({
  ...ZUpdateFolderBase,
  folderId: z.string(),
});

export type ZUpdateFolderType = z.infer<typeof ZUpdateFolder>;

export const ZUpdateFolderForm = z.object({
  ...ZUpdateFolderBase,
});

export type ZUpdateFolderFormType = z.infer<typeof ZUpdateFolderForm>;

export const ZDeleteFolder = z.object({
  folderId: z.string(),
});

export type ZDeleteFolderType = z.infer<typeof ZDeleteFolder>;
