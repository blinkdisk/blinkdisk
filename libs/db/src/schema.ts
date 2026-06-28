import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const vaultProvider = pgEnum("vault_provider", [
  "CLOUDBLINK",
  "INTERNAL_DRIVE",
  "EXTERNAL_DRIVE",
  "NETWORK_DRIVE",
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

export const vaultStatus = pgEnum("vault_status", ["ACTIVE", "DELETED"]);

export const configLevel = pgEnum("config_level", ["VAULT", "PROFILE"]);

export const trialStatus = pgEnum("trial_status", ["ACTIVE", "ENDED"]);

export const subscriptionStatus = pgEnum("subscription_status", [
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
]);

const createdAt = () =>
  timestamp("created_at", { precision: 3, mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`);

const updatedAt = () =>
  timestamp("updated_at", { precision: 3, mode: "date" }).notNull();

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    language: text("language"),
    timeZone: text("time_zone"),
    polarId: text("polar_id"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("account_email_key").on(table.email),
    index("account_email_idx").on(table.email),
  ],
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey().notNull(),
    accountId: text("account_id").notNull(),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("session_token_key").on(table.token),
    index("session_account_id_idx").on(table.accountId),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "session_account_id_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
  ],
);

export const authMethod = pgTable(
  "auth_method",
  {
    id: text("id").primaryKey().notNull(),
    accountId: text("account_id").notNull(),
    authMethodId: text("auth_method_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      precision: 3,
      mode: "date",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      precision: 3,
      mode: "date",
    }),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("auth_method_auth_method_id_key").on(table.authMethodId),
    index("auth_method_account_id_idx").on(table.accountId),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "auth_method_account_id_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey().notNull(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const subscription = pgTable(
  "subscription",
  {
    id: text("id").primaryKey().notNull(),
    status: subscriptionStatus("status").notNull(),
    priceId: text("price_id").notNull(),
    planId: text("plan_id").notNull(),
    polarProductId: text("polar_product_id").notNull(),
    polarSubscriptionId: text("polar_subscription_id").notNull(),
    polarCustomerId: text("polar_customer_id").notNull(),
    accountId: text("account_id").notNull(),
    canceledAt: timestamp("canceled_at", { precision: 3, mode: "date" }),
    endedAt: timestamp("ended_at", { precision: 3, mode: "date" }),
    cleanupAt: timestamp("cleanup_at", { precision: 3, mode: "date" }),
    createdAt: createdAt(),
    affiliateId: text("affiliate_id"),
  },
  (table) => [
    uniqueIndex("subscription_polar_subscription_id_key").on(
      table.polarSubscriptionId,
    ),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "subscription_account_id_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
  ],
);

export const trial = pgTable(
  "trial",
  {
    id: text("id").primaryKey().notNull(),
    status: trialStatus("status").notNull().default("ACTIVE"),
    capacity: bigint("capacity", { mode: "number" }).notNull(),
    accountId: text("account_id").notNull(),
    startedAt: timestamp("started_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
    endsAt: timestamp("ends_at", { precision: 3, mode: "date" }),
    endedAt: timestamp("ended_at", { precision: 3, mode: "date" }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("trial_account_id_key").on(table.accountId),
    index("trial_status_idx").on(table.status),
    index("trial_ends_at_idx").on(table.endsAt),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "trial_account_id_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
  ],
);

export const space = pgTable(
  "space",
  {
    id: text("id").primaryKey().notNull(),
    capacity: bigint("capacity", { mode: "number" }).notNull(),
    used: bigint("used", { mode: "number" }).notNull(),
    accountId: text("account_id").notNull(),
    subscriptionId: text("subscription_id"),
    createdAt: createdAt(),
    trialId: text("trial_id"),
  },
  (table) => [
    uniqueIndex("space_account_id_key").on(table.accountId),
    uniqueIndex("space_trial_id_key").on(table.trialId),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "space_account_id_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
    foreignKey({
      columns: [table.subscriptionId],
      foreignColumns: [subscription.id],
      name: "space_subscription_id_fkey",
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      columns: [table.trialId],
      foreignColumns: [trial.id],
      name: "space_trial_id_fkey",
    })
      .onDelete("set null")
      .onUpdate("cascade"),
  ],
);

export const vault = pgTable(
  "vault",
  {
    id: text("id").primaryKey().notNull(),
    status: vaultStatus("status").notNull(),
    version: integer("version").notNull(),
    provider: vaultProvider("provider").notNull(),
    accountId: text("account_id").notNull(),
    configLevel: configLevel("config_level").notNull(),
    options: jsonb("options").notNull().$type<unknown>(),
    spaceId: text("space_id"),
    createdAt: createdAt(),
    name: text("name").notNull(),
    coreId: text("core_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "vault_account_id_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
    foreignKey({
      columns: [table.spaceId],
      foreignColumns: [space.id],
      name: "vault_space_id_fkey",
    })
      .onDelete("set null")
      .onUpdate("cascade"),
  ],
);

export const config = pgTable(
  "config",
  {
    id: text("id").primaryKey().notNull(),
    data: jsonb("data").notNull().$type<unknown>(),
    level: configLevel("level").notNull(),
    vaultId: text("vault_id").notNull(),
    accountId: text("account_id").notNull(),
    createdAt: createdAt(),
    hostName: text("host_name"),
    userName: text("user_name"),
  },
  (table) => [
    index("config_level_idx").on(table.level),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "config_account_id_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
    foreignKey({
      columns: [table.vaultId],
      foreignColumns: [vault.id],
      name: "config_vault_id_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
  ],
);

export const authSchema = {
  Account: account,
  Session: session,
  AuthMethod: authMethod,
  Verification: verification,
};

export const schema = {
  account,
  session,
  authMethod,
  verification,
  subscription,
  trial,
  space,
  vault,
  config,
};

export type Account = typeof account.$inferSelect;
export type AuthMethod = typeof authMethod.$inferSelect;
export type Config = typeof config.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Space = typeof space.$inferSelect;
export type Subscription = typeof subscription.$inferSelect;
export type Trial = typeof trial.$inferSelect;
export type Vault = typeof vault.$inferSelect;
export type Verification = typeof verification.$inferSelect;
export type DB = typeof schema;
