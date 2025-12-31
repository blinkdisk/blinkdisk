import { z } from "zod";

export const ZHardDeleteStorage = z.object({
  storageId: z.string(),
});

export type ZHardDeleteStorageType = z.infer<typeof ZHardDeleteStorage>;
