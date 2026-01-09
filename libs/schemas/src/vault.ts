import { ZProviderType } from "@schemas/providers";
import {
  ZVaultEncryptedConfig,
  ZVaultName,
  ZVaultPassword,
} from "@schemas/shared/vault";
import { z } from "zod";

export const ZCreateVault = z.object({
  name: ZVaultName,
  provider: ZProviderType,
  passwordHash: z.string().min(1).max(500),
  config: ZVaultEncryptedConfig,
  userName: z.string(),
  hostName: z.string(),
});

export type ZCreateVaultType = z.infer<typeof ZCreateVault>;

export const ZCreateVaultDetails = z.object({
  name: ZVaultName,
  password: ZVaultPassword,
  confirmPassword: ZVaultPassword,
});

export type ZCreateVaultDetailsType = z.infer<typeof ZCreateVaultDetails>;

export const ZCheckName = z.object({
  name: ZVaultName,
});

export type ZCheckNameType = z.infer<typeof ZCheckName>;

export const ZGetVault = z.object({
  vaultId: z.string(),
});

export type ZGetVaultType = z.infer<typeof ZGetVault>;

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

export const ZHardDeleteVault = z.object({
  vaultId: z.string(),
});

export type ZHardDeleteVaultType = z.infer<typeof ZHardDeleteVault>;

export const ZSoftDeleteVault = z.object({
  vaultId: z.string(),
});

export type ZSoftDeleteVaultType = z.infer<typeof ZSoftDeleteVault>;
