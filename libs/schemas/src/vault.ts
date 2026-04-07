import { LATEST_VAULT_VERSION } from "@blinkdisk/constants/vault";
import { VaultStatus } from "@blinkdisk/db/enums";
import { ZConfigLevel, ZVaultEncryptedConfig } from "@schemas/config";
import { ZProviderType } from "@schemas/providers";
import { ZDateString } from "@schemas/shared/date";
import { ZAccountId, ZVaultId } from "@schemas/shared/id";
import { ZProfileHostName, ZProfileUserName } from "@schemas/shared/profile";
import { z } from "zod";

const ZVaultName = z.string().min(1).max(30);

const ZVaultStatus = z.enum(VaultStatus);

const ZVaultPassword = z.string().min(1).max(128);

const ZVaultCoreId = z.string().min(1).max(244);

const ZVaultVersion = z.number().int().min(1).max(LATEST_VAULT_VERSION);

const ZVaultSpaceId = z.string().min(1);

export const ZVaultOptions = z.object({
  version: z.literal(2),
  encryption: z.enum([
    "AES256-GCM-HMAC-SHA256",
    "CHACHA20-POLY1305-HMAC-SHA256",
  ]),
  hash: z.enum([
    "BLAKE2B-256-128",
    "BLAKE2B-256",
    "BLAKE2S-128",
    "BLAKE2S-256",
    "BLAKE3-256",
    "BLAKE3-256-128",
    "HMAC-SHA224",
    "HMAC-SHA256",
    "HMAC-SHA256-128",
    "HMAC-SHA3-224",
    "HMAC-SHA3-256",
  ]),
  splitter: z.enum([
    "DYNAMIC-4M-BUZHASH",
    "DYNAMIC",
    "DYNAMIC-128K-BUZHASH",
    "DYNAMIC-128K-RABINKARP",
    "DYNAMIC-1M-BUZHASH",
    "DYNAMIC-1M-RABINKARP",
    "DYNAMIC-256K-BUZHASH",
    "DYNAMIC-256K-RABINKARP",
    "DYNAMIC-2M-BUZHASH",
    "DYNAMIC-2M-RABINKARP",
    "DYNAMIC-4M-RABINKARP",
    "DYNAMIC-512K-BUZHASH",
    "DYNAMIC-512K-RABINKARP",
    "DYNAMIC-8M-BUZHASH",
    "DYNAMIC-8M-RABINKARP",
    "FIXED",
    "FIXED-128K",
    "FIXED-1M",
    "FIXED-256K",
    "FIXED-2M",
    "FIXED-4M",
    "FIXED-512K",
    "FIXED-8M",
  ]),
  errorCorrectionAlgorithm: z.literal("REED-SOLOMON-CRC32"),
  errorCorrectionOverhead: z.number().min(0).max(100),
});

export type ZVaultOptionsType = z.infer<typeof ZVaultOptions>;

export const ZVault = z.object({
  id: ZVaultId,
  coreId: ZVaultCoreId,
  status: ZVaultStatus,
  name: ZVaultName,
  version: ZVaultVersion,
  provider: ZProviderType,
  accountId: ZAccountId,
  configLevel: ZConfigLevel,
  options: ZVaultOptions,
  spaceId: ZVaultSpaceId,
  createdAt: ZDateString,
});

export type ZVaultType = z.infer<typeof ZVault>;

export const ZCreateVault = z.object({
  id: ZVaultId,
  coreId: ZVaultCoreId.optional(),
  name: ZVaultName,
  provider: ZProviderType,
  config: ZVaultEncryptedConfig,
  userName: ZProfileUserName,
  hostName: ZProfileHostName,
});

export type ZCreateVaultType = z.infer<typeof ZCreateVault>;

export const ZCreateVaultDetails = z.object({
  name: ZVaultName,
  password: ZVaultPassword,
  confirmPassword: ZVaultPassword,
});

export const ZGetVault = z.object({
  vaultId: ZVaultId,
});

export const ZVaultPasswordForm = z.object({
  password: ZVaultPassword,
});

export type ZVaultPasswordFormType = z.infer<typeof ZVaultPasswordForm>;

export const ZUpdateVaultForm = z.object({
  name: ZVaultName,
});

export type ZUpdateVaultFormType = z.infer<typeof ZUpdateVaultForm>;

export const ZUpdateVault = z.object({
  vaultId: ZVaultId,
  name: ZVaultName.optional(),
  version: ZVaultVersion.optional(),
});

export const ZBandwith = z.object({
  value: z.number().min(1).optional(),
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

export const ZDeleteVault = z.object({
  vaultId: ZVaultId,
});

export const ZGetVaultToken = z.object({
  vaultId: ZVaultId,
});
