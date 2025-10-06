import { ZVaultEncryptedConfig } from "@schemas/shared/vault";
import { z } from "zod";

export const ZListConfigs = z.object({
  profileId: z.string(),
});

export type ZListConfigsType = z.infer<typeof ZListConfigs>;

export const ZAddConfig = z.object({
  profileId: z.string(),
  storageId: z.string(),
  config: ZVaultEncryptedConfig,
});

export type ZAddConfigType = z.infer<typeof ZAddConfig>;
