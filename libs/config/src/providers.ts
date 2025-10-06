import { ConfigLevel } from "@db/enums";

export type ProviderType =
  | "BLINKDISK_CLOUD"
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

export type Provider = {
  type: ProviderType;
  coreType: string;
  level: ConfigLevel;
  coreMapping?: Record<string, string>;
  hidden?: boolean;
};

const fileSystemBase = {
  coreType: "filesystem",
};

const s3Base = {
  coreType: "s3",
  coreMapping: {
    accessKeyType: "accessKeyID",
    accessKeySecret: "secretAccessKey",
    disableTls: "doNotUseTLS",
    disableSsl: "doNotVerifySSL",
  },
};

export const providers: Provider[] = [
  {
    type: "BLINKDISK_CLOUD",
    level: "STORAGE",
    coreType: "bdc",
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
    level: "STORAGE",
    coreType: "gcs",
  },
  {
    type: "AMAZON_S3",
    level: "STORAGE",
    ...s3Base,
  },
  {
    type: "S3_COMPATIBLE",
    level: "STORAGE",
    ...s3Base,
  },
  {
    type: "BACKBLAZE",
    level: "STORAGE",
    coreType: "b2",
    coreMapping: {
      keySecret: "key",
    },
  },
  {
    type: "AZURE_BLOB_STORAGE",
    level: "STORAGE",
    coreType: "azureBlob",
    coreMapping: {
      account: "storageAccount",
      key: "storageKey",
      domain: "storageDomain",
    },
  },
  {
    type: "SFTP",
    level: "STORAGE",
    coreType: "sftp",
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
    coreMapping: {
      rclonePath: "rcloneExe",
    },
  },
  {
    type: "WEBDAV",
    level: "STORAGE",
    coreType: "webdav",
    coreMapping: {
      user: "username",
    },
  },
];
