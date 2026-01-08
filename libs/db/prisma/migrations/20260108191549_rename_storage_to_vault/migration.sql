-- Rename StorageProvider enum to VaultProvider
ALTER TYPE "StorageProvider" RENAME TO "VaultProvider";

-- Rename StorageStatus enum to VaultStatus
ALTER TYPE "StorageStatus" RENAME TO "VaultStatus";

-- Migrate ConfigLevel enum: rename STORAGE to VAULT
-- Create new enum with VAULT instead of STORAGE, and convert existing STORAGE values to VAULT
BEGIN;
CREATE TYPE "ConfigLevel_new" AS ENUM ('VAULT', 'PROFILE');
-- Convert STORAGE to VAULT during the type change
ALTER TABLE "Storage" ALTER COLUMN "configLevel" TYPE "ConfigLevel_new" USING (
  CASE 
    WHEN "configLevel"::text = 'STORAGE' THEN 'VAULT'::"ConfigLevel_new"
    ELSE "configLevel"::text::"ConfigLevel_new"
  END
);
ALTER TABLE "Config" ALTER COLUMN "level" TYPE "ConfigLevel_new" USING (
  CASE 
    WHEN "level"::text = 'STORAGE' THEN 'VAULT'::"ConfigLevel_new"
    ELSE "level"::text::"ConfigLevel_new"
  END
);
ALTER TYPE "ConfigLevel" RENAME TO "ConfigLevel_old";
ALTER TYPE "ConfigLevel_new" RENAME TO "ConfigLevel";
DROP TYPE "ConfigLevel_old";
COMMIT;

-- Rename the storageId column to vaultId in Config table
-- First drop the foreign key constraint
ALTER TABLE "Config" DROP CONSTRAINT "Config_storageId_fkey";

-- Rename the column
ALTER TABLE "Config" RENAME COLUMN "storageId" TO "vaultId";

-- Rename the Storage table to Vault
ALTER TABLE "Storage" RENAME TO "Vault";

-- Rename foreign key constraints on the Vault table
ALTER TABLE "Vault" RENAME CONSTRAINT "Storage_pkey" TO "Vault_pkey";
ALTER TABLE "Vault" RENAME CONSTRAINT "Storage_accountId_fkey" TO "Vault_accountId_fkey";
ALTER TABLE "Vault" RENAME CONSTRAINT "Storage_spaceId_fkey" TO "Vault_spaceId_fkey";

-- Recreate the foreign key constraint for Config.vaultId
ALTER TABLE "Config" ADD CONSTRAINT "Config_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
