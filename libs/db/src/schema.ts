import type { ColumnType } from "kysely";
export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type {
  ConfigLevel,
  StorageProvider,
  StorageStatus,
  SubscriptionStatus,
  VaultStatus,
} from "./enums";

export type Account = {
  id: Generated<string>;
  name: string;
  email: string;
  emailVerified: Generated<boolean>;
  image: string | null;
  language: string | null;
  timeZone: string | null;
  polarId: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type AuthMethod = {
  id: Generated<string>;
  accountId: string;
  authMethodId: string;
  providerId: string;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: Timestamp | null;
  refreshTokenExpiresAt: Timestamp | null;
  scope: string | null;
  idToken: string | null;
  password: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Config = {
  id: Generated<string>;
  data: unknown;
  level: ConfigLevel;
  profileId: string | null;
  storageId: string;
  accountId: string;
  createdAt: Generated<Timestamp>;
};
export type Device = {
  id: Generated<string>;
  alias: string;
  hostName: string | null;
  machineId: string | null;
  createdAt: Generated<Timestamp>;
  accountId: string;
};
export type Folder = {
  id: Generated<string>;
  name: string;
  emoji: string;
  hash: string;
  vaultId: string;
  accountId: string;
  createdAt: Generated<Timestamp>;
};
export type Profile = {
  id: Generated<string>;
  alias: string;
  userName: string | null;
  accountId: string;
  deviceId: string;
  createdAt: Generated<Timestamp>;
};
export type Session = {
  id: Generated<string>;
  accountId: string;
  token: string;
  expiresAt: Timestamp;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Space = {
  id: string;
  capacity: string;
  used: string;
  accountId: string;
  subscriptionId: string | null;
  createdAt: Generated<Timestamp>;
};
export type Storage = {
  id: Generated<string>;
  status: StorageStatus;
  version: number;
  provider: StorageProvider;
  accountId: string;
  configLevel: ConfigLevel;
  passwordHash: string;
  options: unknown;
  spaceId: string | null;
  createdAt: Generated<Timestamp>;
};
export type Subscription = {
  id: string;
  status: SubscriptionStatus;
  priceId: string;
  planId: string;
  polarProductId: string;
  polarSubscriptionId: string;
  polarCustomerId: string;
  accountId: string;
  canceledAt: Timestamp | null;
  endedAt: Timestamp | null;
  cleanupAt: Timestamp | null;
  createdAt: Generated<Timestamp>;
};
export type Vault = {
  id: Generated<string>;
  status: VaultStatus;
  name: string;
  profileId: string;
  storageId: string;
  accountId: string;
  createdAt: Generated<Timestamp>;
};
export type Verification = {
  id: Generated<string>;
  identifier: string;
  value: string;
  expiresAt: Timestamp;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type DB = {
  Account: Account;
  AuthMethod: AuthMethod;
  Config: Config;
  Device: Device;
  Folder: Folder;
  Profile: Profile;
  Session: Session;
  Space: Space;
  Storage: Storage;
  Subscription: Subscription;
  Vault: Vault;
  Verification: Verification;
};
