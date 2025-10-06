import { ZProviderType } from "@schemas/providers";
import {
  ZVaultEncryptedConfig,
  ZVaultName,
  ZVaultPassword,
} from "@schemas/shared/vault";
import { z } from "zod";

export const ZCreateVault = z.object({
  profileId: z.string(),
  name: ZVaultName,
  provider: ZProviderType,
  passwordHash: z.string().min(1).max(500),
  config: ZVaultEncryptedConfig,
});

export type ZCreateVaultType = z.infer<typeof ZCreateVault>;

export const ZCreateVaultDetails = z.object({
  name: ZVaultName,
  password: ZVaultPassword,
  confirmPassword: ZVaultPassword,
});

export type ZCreateVaultDetailsType = z.infer<typeof ZCreateVaultDetails>;

export const ZListUnlinkedVaults = z.object({
  profileId: z.string(),
});

export const ZLinkVault = z.object({
  profileId: z.string(),
  storageId: z.string().min(1),
  name: ZVaultName,
  config: ZVaultEncryptedConfig.optional(),
});

export const ZLinkVaultDetails = z.object({
  name: ZVaultName,
});

export type ZLinkVaultDetailsType = z.infer<typeof ZLinkVaultDetails>;

export type ZLinkVaultType = z.infer<typeof ZLinkVault>;

export const ZCheckName = z.object({
  name: ZVaultName,
});

export type ZCheckNameType = z.infer<typeof ZCheckName>;

export const ZDeleteVault = z.object({
  vaultId: z.string(),
});

export type ZDeleteVaultType = z.infer<typeof ZDeleteVault>;

export const ZListVaults = z.object({
  profileId: z.string().optional(),
});

export type ZListVaultsType = z.infer<typeof ZListVaults>;

export const ZGetVault = z.object({
  vaultId: z.string(),
});

export type ZGetVaultType = z.infer<typeof ZGetVault>;

export const ZLinkVaultPassword = z.object({
  password: ZVaultPassword,
});

export type ZLinkVaultPasswordType = z.infer<typeof ZLinkVaultPassword>;

export const ZVaultPasswordForm = z.object({
  password: ZVaultPassword,
});

export type ZVaultPasswordFormType = z.infer<typeof ZVaultPasswordForm>;

export const ZUpdateVaultForm = z.object({
  name: ZVaultName,
});

export type ZUpdateVaultFormType = z.infer<typeof ZUpdateVaultForm>;

export const ZUpdateVault = ZUpdateVaultForm.extend({
  vaultId: z.string(),
});

export type ZUpdateVaultType = z.infer<typeof ZUpdateVaultForm>;

export const ZVaultSpace = z.object({
  vaultId: z.string(),
});

export type ZVaultSpaceType = z.infer<typeof ZVaultSpace>;

export const ZBandwith = z.object({
  value: z.number().optional(),
  unit: z.enum(["bps", "Kbps", "Mbps", "Gbps"]),
});

export type ZBandwithType = z.infer<typeof ZBandwith>;

export const ZVaultThrottle = z.object({
  upload: z.object({
    enabled: z.boolean(),
    limit: ZBandwith,
  }),
  download: z.object({
    enabled: z.boolean(),
    limit: ZBandwith,
  }),
});

export type ZVaultThrottleType = z.infer<typeof ZVaultThrottle>;
