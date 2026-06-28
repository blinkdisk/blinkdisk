CREATE SCHEMA IF NOT EXISTS "drizzle";--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."ConfigLevel" AS ENUM('VAULT', 'PROFILE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."SubscriptionStatus" AS ENUM('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."TrialStatus" AS ENUM('ACTIVE', 'ENDED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."VaultProvider" AS ENUM('CLOUDBLINK', 'INTERNAL_DRIVE', 'EXTERNAL_DRIVE', 'NETWORK_DRIVE', 'FILESYSTEM', 'NETWORK_ATTACHED_STORAGE', 'AMAZON_S3', 'S3_COMPATIBLE', 'GOOGLE_CLOUD_STORAGE', 'BACKBLAZE', 'AZURE_BLOB_STORAGE', 'SFTP', 'RCLONE', 'WEBDAV');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."VaultStatus" AS ENUM('ACTIVE', 'DELETED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Account" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"language" text,
	"timeZone" text,
	"polarId" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AuthMethod" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"authMethodId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"accessTokenExpiresAt" timestamp (3),
	"refreshTokenExpiresAt" timestamp (3),
	"scope" text,
	"idToken" text,
	"password" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Config" (
	"id" text CONSTRAINT "Config_id_not_null" NOT NULL,
	"data" jsonb CONSTRAINT "Config_data_not_null" NOT NULL,
	"level" "ConfigLevel" CONSTRAINT "Config_level_not_null" NOT NULL,
	"profileId" text,
	"vaultId" text CONSTRAINT "Config_storageId_not_null" NOT NULL,
	"accountId" text CONSTRAINT "Config_accountId_not_null" NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP CONSTRAINT "Config_createdAt_not_null" NOT NULL,
	"hostName" text,
	"userName" text,
	CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
ALTER TABLE "Config" DROP COLUMN IF EXISTS "profileId";--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp (3) with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp (3) with time zone,
	"started_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Session" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Space" (
	"id" text PRIMARY KEY NOT NULL,
	"capacity" bigint NOT NULL,
	"used" bigint NOT NULL,
	"accountId" text NOT NULL,
	"subscriptionId" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"trialId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"status" "SubscriptionStatus" NOT NULL,
	"priceId" text NOT NULL,
	"planId" text NOT NULL,
	"polarProductId" text NOT NULL,
	"polarSubscriptionId" text NOT NULL,
	"polarCustomerId" text NOT NULL,
	"accountId" text NOT NULL,
	"canceledAt" timestamp (3),
	"endedAt" timestamp (3),
	"cleanupAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"affiliateId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Trial" (
	"id" text PRIMARY KEY NOT NULL,
	"status" "TrialStatus" DEFAULT 'ACTIVE' NOT NULL,
	"capacity" bigint NOT NULL,
	"accountId" text NOT NULL,
	"startedAt" timestamp (3) NOT NULL,
	"endsAt" timestamp (3),
	"endedAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Vault" (
	"id" text CONSTRAINT "Storage_id_not_null" NOT NULL,
	"status" "VaultStatus" CONSTRAINT "Storage_status_not_null" NOT NULL,
	"version" integer CONSTRAINT "Storage_version_not_null" NOT NULL,
	"provider" "VaultProvider" CONSTRAINT "Storage_provider_not_null" NOT NULL,
	"accountId" text CONSTRAINT "Storage_accountId_not_null" NOT NULL,
	"configLevel" "ConfigLevel" CONSTRAINT "Storage_configLevel_not_null" NOT NULL,
	"passwordHash" text CONSTRAINT "Storage_passwordHash_not_null" NOT NULL,
	"options" jsonb CONSTRAINT "Storage_options_not_null" NOT NULL,
	"spaceId" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP CONSTRAINT "Storage_createdAt_not_null" NOT NULL,
	"name" text CONSTRAINT "Storage_name_not_null" NOT NULL,
	"coreId" text CONSTRAINT "Vault_coreId_not_null" NOT NULL,
	CONSTRAINT "Vault_pkey" PRIMARY KEY ("id")
);
--> statement-breakpoint
ALTER TABLE "Vault" DROP COLUMN IF EXISTS "passwordHash";--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "AuthMethod" ADD CONSTRAINT "AuthMethod_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "Config" ADD CONSTRAINT "Config_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "Config" ADD CONSTRAINT "Config_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "public"."Vault"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "Session" ADD CONSTRAINT "Session_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "Space" ADD CONSTRAINT "Space_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "Space" ADD CONSTRAINT "Space_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."Subscription"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "Space" ADD CONSTRAINT "Space_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "public"."Trial"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "Trial" ADD CONSTRAINT "Trial_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "Vault" ADD CONSTRAINT "Vault_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "Vault" ADD CONSTRAINT "Vault_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "public"."Space"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Account_email_key" ON "Account" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Account_email_idx" ON "Account" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "AuthMethod_authMethodId_key" ON "AuthMethod" USING btree ("authMethodId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AuthMethod_accountId_idx" ON "AuthMethod" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Config_level_idx" ON "Config" USING btree ("level");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session" USING btree ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Session_accountId_idx" ON "Session" USING btree ("accountId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Space_accountId_key" ON "Space" USING btree ("accountId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Space_trialId_key" ON "Space" USING btree ("trialId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_polarSubscriptionId_key" ON "Subscription" USING btree ("polarSubscriptionId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Trial_accountId_key" ON "Trial" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Trial_status_idx" ON "Trial" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Trial_endsAt_idx" ON "Trial" USING btree ("endsAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Verification_identifier_idx" ON "Verification" USING btree ("identifier");
