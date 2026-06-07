import type { ConfigLevel } from "@blinkdisk/db/enums";

export type StorageProviderType =
  | "CLOUDBLINK"
  | "FILESYSTEM"
  | "NETWORK_ATTACHED_STORAGE"
  | "AMAZON_S3"
  | "S3_COMPATIBLE"
  | "GOOGLE_CLOUD_STORAGE"
  | "BACKBLAZE"
  | "AZURE_BLOB_STORAGE"
  | "SFTP"
  | "RCLONE"
  | "WEBDAV";

type StorageProvider = {
  type: StorageProviderType;
  alias?: string[];
  coreType: string;
  level: ConfigLevel;
  local: boolean;
  coreMapping?: Record<string, string>;
  hidden?: boolean;
};

const fileSystemBase = {
  coreType: "filesystem",
  local: true,
};

const s3Base = {
  coreType: "s3",
  local: false,
  coreMapping: {
    accessKeyId: "accessKeyID",
    accessKeySecret: "secretAccessKey",
    disableTls: "doNotUseTLS",
    disableTlsVerification: "doNotVerifyTLS",
  },
};

export const STORAGE_PROVIDERS: StorageProvider[] = [
  {
    type: "CLOUDBLINK",
    alias: ["BLINKDISK_CLOUD", "BLINKCLOUD"],
    level: "VAULT",
    coreType: "bdc",
    local: false,
    hidden: true,
  },
  {
    type: "FILESYSTEM",
    level: "PROFILE",
    ...fileSystemBase,
  },
  {
    type: "NETWORK_ATTACHED_STORAGE",
    level: "PROFILE",
    ...fileSystemBase,
  },
  {
    type: "GOOGLE_CLOUD_STORAGE",
    level: "VAULT",
    coreType: "gcs",
    local: false,
  },
  {
    type: "AMAZON_S3",
    level: "VAULT",
    ...s3Base,
  },
  {
    type: "S3_COMPATIBLE",
    level: "VAULT",
    ...s3Base,
  },
  {
    type: "BACKBLAZE",
    level: "VAULT",
    coreType: "b2",
    local: false,
    coreMapping: {
      keySecret: "key",
    },
  },
  {
    type: "AZURE_BLOB_STORAGE",
    level: "VAULT",
    coreType: "azureBlob",
    local: false,
    coreMapping: {
      account: "storageAccount",
      key: "storageKey",
      domain: "storageDomain",
    },
  },
  {
    type: "SFTP",
    level: "VAULT",
    coreType: "sftp",
    local: false,
    coreMapping: {
      user: "username",
      privateKey: "keyData",
      knownHosts: "knownHostsData",
    },
  },
  {
    type: "RCLONE",
    level: "PROFILE",
    coreType: "rclone",
    local: false,
    coreMapping: {
      rclonePath: "rcloneExe",
    },
  },
  {
    type: "WEBDAV",
    level: "VAULT",
    coreType: "webdav",
    local: false,
    coreMapping: {
      user: "username",
    },
  },
];
