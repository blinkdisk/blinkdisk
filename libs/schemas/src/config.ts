import { ConfigLevel } from "@blinkdisk/db/enums";
import { ZDateString } from "@schemas/shared/date";
import { ZVaultId } from "@schemas/shared/id";
import { ZProfileHostName, ZProfileUserName } from "@schemas/shared/profile";
import { z } from "zod";

const ZConfigId = z.string().min(1);

export const ZConfigLevel = z.enum(ConfigLevel);

export const ZVaultEncryptedConfig = z.object({
  iv: z.string().min(1),
  salt: z.string().min(1),
  cipher: z.string().min(1).max(10000),
});

export const ZConfig = z.object({
  id: ZConfigId,
  data: ZVaultEncryptedConfig,
  level: ZConfigLevel,
  userName: ZProfileUserName.nullable().optional(),
  hostName: ZProfileHostName.nullable().optional(),
  vaultId: ZVaultId,
  createdAt: ZDateString,
});

export type ZConfigType = z.infer<typeof ZConfig>;

export const ZPushConfigs = z.object({
  added: z.array(ZConfig),
  modified: z.array(ZConfig),
});
