import { ConfigLevel } from "@blinkdisk/db/enums";
import { ZAccountId } from "@schemas/accounts";
import { ZDateString } from "@schemas/shared/date";
import { ZProfileHostName, ZProfileUserName } from "@schemas/shared/profile";
import { ZVaultEncryptedConfig, ZVaultId } from "@schemas/vault";
import { z } from "zod";

const ZConfigId = z.string().min(1);

export const ZConfigLevel = z.nativeEnum(ConfigLevel);

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

export const ZAddConfig = z.object({
  userName: ZProfileUserName,
  hostName: ZProfileHostName,
  vaultId: ZVaultId,
  config: ZVaultEncryptedConfig,
});
