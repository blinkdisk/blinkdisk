ALTER TYPE "public"."ConfigLevel" RENAME TO "config_level";--> statement-breakpoint
ALTER TYPE "public"."SubscriptionStatus" RENAME TO "subscription_status";--> statement-breakpoint
ALTER TYPE "public"."TrialStatus" RENAME TO "trial_status";--> statement-breakpoint
ALTER TYPE "public"."VaultProvider" RENAME TO "vault_provider";--> statement-breakpoint
ALTER TYPE "public"."VaultStatus" RENAME TO "vault_status";--> statement-breakpoint
ALTER TABLE "Account" RENAME TO "account";--> statement-breakpoint
ALTER TABLE "AuthMethod" RENAME TO "auth_method";--> statement-breakpoint
ALTER TABLE "Config" RENAME TO "config";--> statement-breakpoint
ALTER TABLE "Session" RENAME TO "session";--> statement-breakpoint
ALTER TABLE "Space" RENAME TO "space";--> statement-breakpoint
ALTER TABLE "Subscription" RENAME TO "subscription";--> statement-breakpoint
ALTER TABLE "Trial" RENAME TO "trial";--> statement-breakpoint
ALTER TABLE "Vault" RENAME TO "vault";--> statement-breakpoint
ALTER TABLE "Verification" RENAME TO "verification";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "emailVerified" TO "email_verified";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "timeZone" TO "time_zone";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "polarId" TO "polar_id";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "auth_method" RENAME COLUMN "accountId" TO "account_id";--> statement-breakpoint
ALTER TABLE "auth_method" RENAME COLUMN "authMethodId" TO "auth_method_id";--> statement-breakpoint
ALTER TABLE "auth_method" RENAME COLUMN "providerId" TO "provider_id";--> statement-breakpoint
ALTER TABLE "auth_method" RENAME COLUMN "accessToken" TO "access_token";--> statement-breakpoint
ALTER TABLE "auth_method" RENAME COLUMN "refreshToken" TO "refresh_token";--> statement-breakpoint
ALTER TABLE "auth_method" RENAME COLUMN "accessTokenExpiresAt" TO "access_token_expires_at";--> statement-breakpoint
ALTER TABLE "auth_method" RENAME COLUMN "refreshTokenExpiresAt" TO "refresh_token_expires_at";--> statement-breakpoint
ALTER TABLE "auth_method" RENAME COLUMN "idToken" TO "id_token";--> statement-breakpoint
ALTER TABLE "auth_method" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "auth_method" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "config" RENAME COLUMN "vaultId" TO "vault_id";--> statement-breakpoint
ALTER TABLE "config" RENAME COLUMN "accountId" TO "account_id";--> statement-breakpoint
ALTER TABLE "config" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "config" RENAME COLUMN "hostName" TO "host_name";--> statement-breakpoint
ALTER TABLE "config" RENAME COLUMN "userName" TO "user_name";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "accountId" TO "account_id";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "expiresAt" TO "expires_at";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "ipAddress" TO "ip_address";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "userAgent" TO "user_agent";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "space" RENAME COLUMN "accountId" TO "account_id";--> statement-breakpoint
ALTER TABLE "space" RENAME COLUMN "subscriptionId" TO "subscription_id";--> statement-breakpoint
ALTER TABLE "space" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "space" RENAME COLUMN "trialId" TO "trial_id";--> statement-breakpoint
ALTER TABLE "subscription" RENAME COLUMN "priceId" TO "price_id";--> statement-breakpoint
ALTER TABLE "subscription" RENAME COLUMN "planId" TO "plan_id";--> statement-breakpoint
ALTER TABLE "subscription" RENAME COLUMN "polarProductId" TO "polar_product_id";--> statement-breakpoint
ALTER TABLE "subscription" RENAME COLUMN "polarSubscriptionId" TO "polar_subscription_id";--> statement-breakpoint
ALTER TABLE "subscription" RENAME COLUMN "polarCustomerId" TO "polar_customer_id";--> statement-breakpoint
ALTER TABLE "subscription" RENAME COLUMN "accountId" TO "account_id";--> statement-breakpoint
ALTER TABLE "subscription" RENAME COLUMN "canceledAt" TO "canceled_at";--> statement-breakpoint
ALTER TABLE "subscription" RENAME COLUMN "endedAt" TO "ended_at";--> statement-breakpoint
ALTER TABLE "subscription" RENAME COLUMN "cleanupAt" TO "cleanup_at";--> statement-breakpoint
ALTER TABLE "subscription" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "subscription" RENAME COLUMN "affiliateId" TO "affiliate_id";--> statement-breakpoint
ALTER TABLE "trial" RENAME COLUMN "accountId" TO "account_id";--> statement-breakpoint
ALTER TABLE "trial" RENAME COLUMN "startedAt" TO "started_at";--> statement-breakpoint
ALTER TABLE "trial" RENAME COLUMN "endsAt" TO "ends_at";--> statement-breakpoint
ALTER TABLE "trial" RENAME COLUMN "endedAt" TO "ended_at";--> statement-breakpoint
ALTER TABLE "trial" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "vault" RENAME COLUMN "accountId" TO "account_id";--> statement-breakpoint
ALTER TABLE "vault" RENAME COLUMN "configLevel" TO "config_level";--> statement-breakpoint
ALTER TABLE "vault" RENAME COLUMN "spaceId" TO "space_id";--> statement-breakpoint
ALTER TABLE "vault" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "vault" RENAME COLUMN "coreId" TO "core_id";--> statement-breakpoint
ALTER TABLE "verification" RENAME COLUMN "expiresAt" TO "expires_at";--> statement-breakpoint
ALTER TABLE "verification" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "verification" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
DO $$ BEGIN
  IF to_regclass('public.account') IS NOT NULL THEN
    ALTER TABLE "account" RENAME CONSTRAINT "Account_pkey" TO "account_pkey";
  END IF;
  IF to_regclass('public.auth_method') IS NOT NULL THEN
    ALTER TABLE "auth_method" RENAME CONSTRAINT "AuthMethod_pkey" TO "auth_method_pkey";
    ALTER TABLE "auth_method" RENAME CONSTRAINT "AuthMethod_accountId_fkey" TO "auth_method_account_id_fkey";
  END IF;
  IF to_regclass('public.config') IS NOT NULL THEN
    ALTER TABLE "config" RENAME CONSTRAINT "Config_pkey" TO "config_pkey";
    ALTER TABLE "config" RENAME CONSTRAINT "Config_accountId_fkey" TO "config_account_id_fkey";
    ALTER TABLE "config" RENAME CONSTRAINT "Config_vaultId_fkey" TO "config_vault_id_fkey";
  END IF;
  IF to_regclass('public.session') IS NOT NULL THEN
    ALTER TABLE "session" RENAME CONSTRAINT "Session_pkey" TO "session_pkey";
    ALTER TABLE "session" RENAME CONSTRAINT "Session_accountId_fkey" TO "session_account_id_fkey";
  END IF;
  IF to_regclass('public.space') IS NOT NULL THEN
    ALTER TABLE "space" RENAME CONSTRAINT "Space_pkey" TO "space_pkey";
    ALTER TABLE "space" RENAME CONSTRAINT "Space_accountId_fkey" TO "space_account_id_fkey";
    ALTER TABLE "space" RENAME CONSTRAINT "Space_subscriptionId_fkey" TO "space_subscription_id_fkey";
    ALTER TABLE "space" RENAME CONSTRAINT "Space_trialId_fkey" TO "space_trial_id_fkey";
  END IF;
  IF to_regclass('public.subscription') IS NOT NULL THEN
    ALTER TABLE "subscription" RENAME CONSTRAINT "Subscription_pkey" TO "subscription_pkey";
    ALTER TABLE "subscription" RENAME CONSTRAINT "Subscription_accountId_fkey" TO "subscription_account_id_fkey";
  END IF;
  IF to_regclass('public.trial') IS NOT NULL THEN
    ALTER TABLE "trial" RENAME CONSTRAINT "Trial_pkey" TO "trial_pkey";
    ALTER TABLE "trial" RENAME CONSTRAINT "Trial_accountId_fkey" TO "trial_account_id_fkey";
  END IF;
  IF to_regclass('public.vault') IS NOT NULL THEN
    ALTER TABLE "vault" RENAME CONSTRAINT "Vault_pkey" TO "vault_pkey";
    ALTER TABLE "vault" RENAME CONSTRAINT "Vault_accountId_fkey" TO "vault_account_id_fkey";
    ALTER TABLE "vault" RENAME CONSTRAINT "Vault_spaceId_fkey" TO "vault_space_id_fkey";
  END IF;
  IF to_regclass('public.verification') IS NOT NULL THEN
    ALTER TABLE "verification" RENAME CONSTRAINT "Verification_pkey" TO "verification_pkey";
  END IF;
END $$;--> statement-breakpoint
DO $$ DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT * FROM (VALUES
      ('account', 'Account_id_not_null', 'account_id_not_null'),
      ('account', 'Account_name_not_null', 'account_name_not_null'),
      ('account', 'Account_email_not_null', 'account_email_not_null'),
      ('account', 'Account_emailVerified_not_null', 'account_email_verified_not_null'),
      ('account', 'Account_createdAt_not_null', 'account_created_at_not_null'),
      ('account', 'Account_updatedAt_not_null', 'account_updated_at_not_null'),
      ('auth_method', 'AuthMethod_id_not_null', 'auth_method_id_not_null'),
      ('auth_method', 'AuthMethod_accountId_not_null', 'auth_method_account_id_not_null'),
      ('auth_method', 'AuthMethod_authMethodId_not_null', 'auth_method_auth_method_id_not_null'),
      ('auth_method', 'AuthMethod_providerId_not_null', 'auth_method_provider_id_not_null'),
      ('auth_method', 'AuthMethod_createdAt_not_null', 'auth_method_created_at_not_null'),
      ('auth_method', 'AuthMethod_updatedAt_not_null', 'auth_method_updated_at_not_null'),
      ('config', 'Config_id_not_null', 'config_id_not_null'),
      ('config', 'Config_data_not_null', 'config_data_not_null'),
      ('config', 'Config_level_not_null', 'config_level_not_null'),
      ('config', 'Config_storageId_not_null', 'config_vault_id_not_null'),
      ('config', 'Config_accountId_not_null', 'config_account_id_not_null'),
      ('config', 'Config_createdAt_not_null', 'config_created_at_not_null'),
      ('session', 'Session_id_not_null', 'session_id_not_null'),
      ('session', 'Session_accountId_not_null', 'session_account_id_not_null'),
      ('session', 'Session_token_not_null', 'session_token_not_null'),
      ('session', 'Session_expiresAt_not_null', 'session_expires_at_not_null'),
      ('session', 'Session_createdAt_not_null', 'session_created_at_not_null'),
      ('session', 'Session_updatedAt_not_null', 'session_updated_at_not_null'),
      ('space', 'Space_id_not_null', 'space_id_not_null'),
      ('space', 'Space_capacity_not_null', 'space_capacity_not_null'),
      ('space', 'Space_used_not_null', 'space_used_not_null'),
      ('space', 'Space_accountId_not_null', 'space_account_id_not_null'),
      ('space', 'Space_createdAt_not_null', 'space_created_at_not_null'),
      ('subscription', 'Subscription_id_not_null', 'subscription_id_not_null'),
      ('subscription', 'Subscription_status_not_null', 'subscription_status_not_null'),
      ('subscription', 'Subscription_priceId_not_null', 'subscription_price_id_not_null'),
      ('subscription', 'Subscription_planId_not_null', 'subscription_plan_id_not_null'),
      ('subscription', 'Subscription_polarProductId_not_null', 'subscription_polar_product_id_not_null'),
      ('subscription', 'Subscription_polarSubscriptionId_not_null', 'subscription_polar_subscription_id_not_null'),
      ('subscription', 'Subscription_polarCustomerId_not_null', 'subscription_polar_customer_id_not_null'),
      ('subscription', 'Subscription_accountId_not_null', 'subscription_account_id_not_null'),
      ('subscription', 'Subscription_createdAt_not_null', 'subscription_created_at_not_null'),
      ('trial', 'Trial_id_not_null', 'trial_id_not_null'),
      ('trial', 'Trial_status_not_null', 'trial_status_not_null'),
      ('trial', 'Trial_capacity_not_null', 'trial_capacity_not_null'),
      ('trial', 'Trial_accountId_not_null', 'trial_account_id_not_null'),
      ('trial', 'Trial_startedAt_not_null', 'trial_started_at_not_null'),
      ('trial', 'Trial_createdAt_not_null', 'trial_created_at_not_null'),
      ('vault', 'Storage_id_not_null', 'vault_id_not_null'),
      ('vault', 'Storage_status_not_null', 'vault_status_not_null'),
      ('vault', 'Storage_version_not_null', 'vault_version_not_null'),
      ('vault', 'Storage_provider_not_null', 'vault_provider_not_null'),
      ('vault', 'Storage_accountId_not_null', 'vault_account_id_not_null'),
      ('vault', 'Storage_configLevel_not_null', 'vault_config_level_not_null'),
      ('vault', 'Storage_options_not_null', 'vault_options_not_null'),
      ('vault', 'Storage_createdAt_not_null', 'vault_created_at_not_null'),
      ('vault', 'Storage_name_not_null', 'vault_name_not_null'),
      ('vault', 'Vault_coreId_not_null', 'vault_core_id_not_null'),
      ('verification', 'Verification_id_not_null', 'verification_id_not_null'),
      ('verification', 'Verification_identifier_not_null', 'verification_identifier_not_null'),
      ('verification', 'Verification_value_not_null', 'verification_value_not_null'),
      ('verification', 'Verification_expiresAt_not_null', 'verification_expires_at_not_null'),
      ('verification', 'Verification_createdAt_not_null', 'verification_created_at_not_null'),
      ('verification', 'Verification_updatedAt_not_null', 'verification_updated_at_not_null')
    ) AS mapping(table_name, old_name, new_name)
  LOOP
    IF EXISTS (
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public'
        AND t.relname = item.table_name
        AND c.conname = item.old_name
    ) AND NOT EXISTS (
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public'
        AND t.relname = item.table_name
        AND c.conname = item.new_name
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I.%I RENAME CONSTRAINT %I TO %I',
        'public',
        item.table_name,
        item.old_name,
        item.new_name
      );
    END IF;
  END LOOP;
END $$;--> statement-breakpoint
ALTER INDEX IF EXISTS "Account_email_key" RENAME TO "account_email_key";--> statement-breakpoint
ALTER INDEX IF EXISTS "Account_email_idx" RENAME TO "account_email_idx";--> statement-breakpoint
ALTER INDEX IF EXISTS "AuthMethod_authMethodId_key" RENAME TO "auth_method_auth_method_id_key";--> statement-breakpoint
ALTER INDEX IF EXISTS "AuthMethod_accountId_idx" RENAME TO "auth_method_account_id_idx";--> statement-breakpoint
ALTER INDEX IF EXISTS "Config_level_idx" RENAME TO "config_level_idx";--> statement-breakpoint
ALTER INDEX IF EXISTS "Session_token_key" RENAME TO "session_token_key";--> statement-breakpoint
ALTER INDEX IF EXISTS "Session_accountId_idx" RENAME TO "session_account_id_idx";--> statement-breakpoint
ALTER INDEX IF EXISTS "Space_accountId_key" RENAME TO "space_account_id_key";--> statement-breakpoint
ALTER INDEX IF EXISTS "Space_trialId_key" RENAME TO "space_trial_id_key";--> statement-breakpoint
ALTER INDEX IF EXISTS "Subscription_polarSubscriptionId_key" RENAME TO "subscription_polar_subscription_id_key";--> statement-breakpoint
ALTER INDEX IF EXISTS "Trial_accountId_key" RENAME TO "trial_account_id_key";--> statement-breakpoint
ALTER INDEX IF EXISTS "Trial_status_idx" RENAME TO "trial_status_idx";--> statement-breakpoint
ALTER INDEX IF EXISTS "Trial_endsAt_idx" RENAME TO "trial_ends_at_idx";--> statement-breakpoint
ALTER INDEX IF EXISTS "Verification_identifier_idx" RENAME TO "verification_identifier_idx";
