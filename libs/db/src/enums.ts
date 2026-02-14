export const VaultProvider = {
  BLINKCLOUD: "BLINKCLOUD",
  FILESYSTEM: "FILESYSTEM",
  NETWORK_ATTACHED_STORAGE: "NETWORK_ATTACHED_STORAGE",
  AMAZON_S3: "AMAZON_S3",
  S3_COMPATIBLE: "S3_COMPATIBLE",
  GOOGLE_CLOUD_STORAGE: "GOOGLE_CLOUD_STORAGE",
  BACKBLAZE: "BACKBLAZE",
  AZURE_BLOB_STORAGE: "AZURE_BLOB_STORAGE",
  SFTP: "SFTP",
  RCLONE: "RCLONE",
  WEBDAV: "WEBDAV",
} as const;
export type VaultProvider = (typeof VaultProvider)[keyof typeof VaultProvider];
export const VaultStatus = {
  ACTIVE: "ACTIVE",
  DELETED: "DELETED",
} as const;
export type VaultStatus = (typeof VaultStatus)[keyof typeof VaultStatus];
export const ConfigLevel = {
  VAULT: "VAULT",
  PROFILE: "PROFILE",
} as const;
export type ConfigLevel = (typeof ConfigLevel)[keyof typeof ConfigLevel];
export const SubscriptionStatus = {
  TRIALING: "TRIALING",
  ACTIVE: "ACTIVE",
  PAST_DUE: "PAST_DUE",
  CANCELED: "CANCELED",
} as const;
export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
