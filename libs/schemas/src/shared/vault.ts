import { z } from "zod";

export const ZVaultName = z.string().min(1).max(30);

export const ZVaultEncryptedConfig = z.object({
  iv: z.string().min(1),
  salt: z.string().min(1),
  cipher: z.string().min(1).max(10000),
});

export type ZVaultEncryptedConfigType = z.infer<typeof ZVaultEncryptedConfig>;

export const ZVaultPassword = z.string().min(1).max(128);
