import { z } from "zod";

export const ZBlinkCloudConfig = z.object({});

export type ZBlinkCloudConfigType = z.infer<typeof ZBlinkCloudConfig>;

export const ZFilesystemConfig = z.object({
  path: z.string().min(1).max(512),
});

export type ZFilesystemConfigType = z.infer<typeof ZFilesystemConfig>;

const ZS3Config = z.object({
  endpoint: z.string().min(1).max(512),
  bucket: z.string().min(1).max(512),
  accessKeyId: z.string().min(1).max(128),
  accessKeySecret: z.string().min(1).max(128).optional(),
  sessionToken: z.string().max(1024).optional(),
  prefix: z.string().max(128).optional(),
});

export const ZAmazonS3Config = ZS3Config.merge(
  z.object({ region: z.string().min(1).max(128) }),
);

export type ZAmazonS3ConfigType = z.infer<typeof ZAmazonS3Config>;

export const ZS3CompatibleConfig = ZS3Config.merge(
  z.object({
    region: z.string().max(128).optional(),
    disableTls: z.boolean(),
    disableSsl: z.boolean(),
  }),
);

export type ZS3CompatibleConfigType = z.infer<typeof ZS3CompatibleConfig>;

export const ZGoogleCloudStorageConfig = z.object({
  bucket: z.string().min(1).max(512),
  prefix: z.string().max(128).optional(),
  credentials: z.string().min(1).max(10000),
});

export type ZGoogleCloudStorageConfigType = z.infer<
  typeof ZGoogleCloudStorageConfig
>;

export const ZBackblazeConfig = z.object({
  bucket: z.string().min(1).max(128),
  keyId: z.string().min(1).max(128),
  keySecret: z.string().min(1).max(128).optional(),
  prefix: z.string().max(128),
});

export type ZBackblazeConfigType = z.infer<typeof ZBackblazeConfig>;

export const ZAzureBlobStorageConfig = z.object({
  container: z.string().min(1).max(128),
  account: z.string().min(1).max(128),
  key: z.string().max(128).optional(),
  domain: z.string().max(128).optional(),
  sasToken: z.string().max(2048).optional(),
  prefix: z.string().max(128).optional(),
});

export type ZAzureBlobStorageConfigType = z.infer<
  typeof ZAzureBlobStorageConfig
>;

export const ZSftpConfig = z.object({
  host: z.string().min(1).max(255),
  user: z.string().min(1).max(32),
  port: z.number().int().positive(),
  path: z.string().min(1).max(4096),
  password: z.string().max(128).optional(),
  privateKey: z.string().max(10000).optional(),
  knownHosts: z.string().min(1).max(10000),
});

export type ZSftpConfigType = z.infer<typeof ZSftpConfig>;

export const ZRcloneConfig = z.object({
  remotePath: z.string().min(1).max(4096),
  rclonePath: z.string().max(4096).optional(),
});

export type ZRcloneConfigType = z.infer<typeof ZRcloneConfig>;

export const ZWebDavConfig = z.object({
  url: z.string().url().min(1).max(2048),
  user: z.string().max(128).optional(),
  password: z.string().max(128).optional(),
});

export type ZWebDavConfigType = z.infer<typeof ZWebDavConfig>;

export type ProviderConfig =
  | ZBlinkCloudConfigType
  | ZS3CompatibleConfigType
  | ZAmazonS3ConfigType
  | ZS3CompatibleConfigType
  | ZGoogleCloudStorageConfigType
  | ZBackblazeConfigType
  | ZAzureBlobStorageConfigType
  | ZWebDavConfigType;

export const ZProviderType = z.enum([
  "BLINKCLOUD",
  "FILESYSTEM",
  "NETWORK_ATTACHED_STORAGE",
  "AMAZON_S3",
  "S3_COMPATIBLE",
  "GOOGLE_CLOUD_STORAGE",
  "BACKBLAZE",
  "AZURE_BLOB_STORAGE",
  "SFTP",
  "RCLONE",
  "WEBDAV",
]);

export type ZProviderType = z.infer<typeof ZProviderType>;
