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
  varchar,
} from "drizzle-orm/pg-core";

export const vaultProvider = pgEnum("VaultProvider", [
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

export const vaultStatus = pgEnum("VaultStatus", ["ACTIVE", "DELETED"]);

export const configLevel = pgEnum("ConfigLevel", ["VAULT", "PROFILE"]);

export const trialStatus = pgEnum("TrialStatus", ["ACTIVE", "ENDED"]);

export const subscriptionStatus = pgEnum("SubscriptionStatus", [
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
]);

const createdAt = () =>
  timestamp("createdAt", { precision: 3, mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`);

const updatedAt = () =>
  timestamp("updatedAt", { precision: 3, mode: "date" }).notNull();

export const account = pgTable(
  "Account",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("emailVerified").notNull().default(false),
    image: text("image"),
    language: text("language"),
    timeZone: text("timeZone"),
    polarId: text("polarId"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("Account_email_key").on(table.email),
    index("Account_email_idx").on(table.email),
  ],
);

export const session = pgTable(
  "Session",
  {
    id: text("id").primaryKey().notNull(),
    accountId: text("accountId").notNull(),
    token: text("token").notNull(),
    expiresAt: timestamp("expiresAt", {
      precision: 3,
      mode: "date",
    }).notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("Session_token_key").on(table.token),
    index("Session_accountId_idx").on(table.accountId),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "Session_accountId_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
  ],
);

export const authMethod = pgTable(
  "AuthMethod",
  {
    id: text("id").primaryKey().notNull(),
    accountId: text("accountId").notNull(),
    authMethodId: text("authMethodId").notNull(),
    providerId: text("providerId").notNull(),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
      precision: 3,
      mode: "date",
    }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
      precision: 3,
      mode: "date",
    }),
    scope: text("scope"),
    idToken: text("idToken"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("AuthMethod_authMethodId_key").on(table.authMethodId),
    index("AuthMethod_accountId_idx").on(table.accountId),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "AuthMethod_accountId_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
  ],
);

export const verification = pgTable(
  "Verification",
  {
    id: text("id").primaryKey().notNull(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt", {
      precision: 3,
      mode: "date",
    }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("Verification_identifier_idx").on(table.identifier)],
);

export const subscription = pgTable(
  "Subscription",
  {
    id: text("id").primaryKey().notNull(),
    status: subscriptionStatus("status").notNull(),
    priceId: text("priceId").notNull(),
    planId: text("planId").notNull(),
    polarProductId: text("polarProductId").notNull(),
    polarSubscriptionId: text("polarSubscriptionId").notNull(),
    polarCustomerId: text("polarCustomerId").notNull(),
    accountId: text("accountId").notNull(),
    canceledAt: timestamp("canceledAt", { precision: 3, mode: "date" }),
    endedAt: timestamp("endedAt", { precision: 3, mode: "date" }),
    cleanupAt: timestamp("cleanupAt", { precision: 3, mode: "date" }),
    createdAt: createdAt(),
    affiliateId: text("affiliateId"),
  },
  (table) => [
    uniqueIndex("Subscription_polarSubscriptionId_key").on(
      table.polarSubscriptionId,
    ),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "Subscription_accountId_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
  ],
);

export const trial = pgTable(
  "Trial",
  {
    id: text("id").primaryKey().notNull(),
    status: trialStatus("status").notNull().default("ACTIVE"),
    capacity: bigint("capacity", { mode: "number" }).notNull(),
    accountId: text("accountId").notNull(),
    startedAt: timestamp("startedAt", {
      precision: 3,
      mode: "date",
    }).notNull(),
    endsAt: timestamp("endsAt", { precision: 3, mode: "date" }),
    endedAt: timestamp("endedAt", { precision: 3, mode: "date" }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("Trial_accountId_key").on(table.accountId),
    index("Trial_status_idx").on(table.status),
    index("Trial_endsAt_idx").on(table.endsAt),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "Trial_accountId_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
  ],
);

export const space = pgTable(
  "Space",
  {
    id: text("id").primaryKey().notNull(),
    capacity: bigint("capacity", { mode: "number" }).notNull(),
    used: bigint("used", { mode: "number" }).notNull(),
    accountId: text("accountId").notNull(),
    subscriptionId: text("subscriptionId"),
    createdAt: createdAt(),
    trialId: text("trialId"),
  },
  (table) => [
    uniqueIndex("Space_accountId_key").on(table.accountId),
    uniqueIndex("Space_trialId_key").on(table.trialId),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "Space_accountId_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
    foreignKey({
      columns: [table.subscriptionId],
      foreignColumns: [subscription.id],
      name: "Space_subscriptionId_fkey",
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      columns: [table.trialId],
      foreignColumns: [trial.id],
      name: "Space_trialId_fkey",
    })
      .onDelete("set null")
      .onUpdate("cascade"),
  ],
);

export const vault = pgTable(
  "Vault",
  {
    id: text("id").primaryKey().notNull(),
    status: vaultStatus("status").notNull(),
    version: integer("version").notNull(),
    provider: vaultProvider("provider").notNull(),
    accountId: text("accountId").notNull(),
    configLevel: configLevel("configLevel").notNull(),
    options: jsonb("options").notNull().$type<unknown>(),
    spaceId: text("spaceId"),
    createdAt: createdAt(),
    name: text("name").notNull(),
    coreId: text("coreId").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "Vault_accountId_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
    foreignKey({
      columns: [table.spaceId],
      foreignColumns: [space.id],
      name: "Vault_spaceId_fkey",
    })
      .onDelete("set null")
      .onUpdate("cascade"),
  ],
);

export const config = pgTable(
  "Config",
  {
    id: text("id").primaryKey().notNull(),
    data: jsonb("data").notNull().$type<unknown>(),
    level: configLevel("level").notNull(),
    vaultId: text("vaultId").notNull(),
    accountId: text("accountId").notNull(),
    createdAt: createdAt(),
    hostName: text("hostName"),
    userName: text("userName"),
  },
  (table) => [
    index("Config_level_idx").on(table.level),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "Config_accountId_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
    foreignKey({
      columns: [table.vaultId],
      foreignColumns: [vault.id],
      name: "Config_vaultId_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
  ],
);

export const prismaMigrations = pgTable("_prisma_migrations", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  checksum: varchar("checksum", { length: 64 }).notNull(),
  finishedAt: timestamp("finished_at", {
    precision: 3,
    withTimezone: true,
    mode: "date",
  }),
  migrationName: varchar("migration_name", { length: 255 }).notNull(),
  logs: text("logs"),
  rolledBackAt: timestamp("rolled_back_at", {
    precision: 3,
    withTimezone: true,
    mode: "date",
  }),
  startedAt: timestamp("started_at", {
    precision: 3,
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .default(sql`now()`),
  appliedStepsCount: integer("applied_steps_count").notNull().default(0),
});

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
  prismaMigrations,
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
