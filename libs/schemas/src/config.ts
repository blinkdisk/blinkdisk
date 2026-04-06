import { ConfigLevel } from "@blinkdisk/db/enums";
import { ZAccountId } from "@schemas/shared/id";
import { ZDateString } from "@schemas/shared/date";
import { ZProfileHostName, ZProfileUserName } from "@schemas/shared/profile";
import { ZVaultId } from "@schemas/shared/id";
import { z } from "zod";

const ZConfigId = z.string().min(1);

export const ZConfigLevel = z.enum(ConfigLevel);

export const ZVaultEncryptedConfig = z.object({
  iv: z.string().min(1),
  salt: z.string().min(1),
  cipher: z.string().min(1).max(10000),
});

export type ZVaultEncryptedConfigType = z.infer<typeof ZVaultEncryptedConfig>;

export const ZConfig = z.object({
  id: ZConfigId,
  data: ZVaultEncryptedConfig,
  level: ZConfigLevel,
  userName: ZProfileUserName.optional(),
  hostName: ZProfileHostName.optional(),
  vaultId: ZVaultId,
  accountId: ZAccountId,
  createdAt: ZDateString,
});

export type ZConfigType = z.infer<typeof ZConfig>;

export const ZAddConfig = z.object({
  userName: ZProfileUserName,
  hostName: ZProfileHostName,
  vaultId: ZVaultId,
  config: ZVaultEncryptedConfig,
});
