import { ZVaultEncryptedConfig } from "@schemas/shared/vault";
import { z } from "zod";

export const ZAddConfig = z.object({
  userName: z.string(),
  hostName: z.string(),
  vaultId: z.string(),
  config: ZVaultEncryptedConfig,
});
