-- Delete the vault table
ALTER TABLE "Vault" DROP CONSTRAINT "Vault_accountId_fkey";
ALTER TABLE "Vault" DROP CONSTRAINT "Vault_profileId_fkey";
ALTER TABLE "Vault" DROP CONSTRAINT "Vault_storageId_fkey";
DROP TABLE "Vault";
DROP TYPE "VaultStatus";
