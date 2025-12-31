import { z } from "zod";

export const ZHardDeleteStorage = z.object({
  storageId: z.string(),
});

export type ZHardDeleteStorageType = z.infer<typeof ZHardDeleteStorage>;

export const ZSoftDeleteStorage = z.object({
  vaultId: z.string(),
});

export type ZSoftDeleteStorageType = z.infer<typeof ZSoftDeleteStorage>;
