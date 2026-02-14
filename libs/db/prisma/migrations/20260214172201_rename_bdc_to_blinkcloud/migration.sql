-- Both BLINKDISK_CLOUD and BLINKCLOUD
BEGIN;
CREATE TYPE "VaultProvider_new" AS ENUM ('BLINKDISK_CLOUD', 'BLINKCLOUD', 'FILESYSTEM', 'NETWORK_ATTACHED_STORAGE', 'AMAZON_S3', 'S3_COMPATIBLE', 'GOOGLE_CLOUD_STORAGE', 'BACKBLAZE', 'AZURE_BLOB_STORAGE', 'SFTP', 'RCLONE', 'WEBDAV');
ALTER TABLE "Vault" ALTER COLUMN "provider" TYPE "VaultProvider_new" USING ("provider"::text::"VaultProvider_new");
ALTER TYPE "VaultProvider" RENAME TO "VaultProvider_old";
ALTER TYPE "VaultProvider_new" RENAME TO "VaultProvider";
DROP TYPE "VaultProvider_old";
COMMIT;

-- Update rows from BLINKDISK_CLOUD to BLINKCLOUD
UPDATE "Vault" SET "provider" = 'BLINKCLOUD' WHERE "provider" = 'BLINKDISK_CLOUD';

-- Remove BLINKDISK_CLOUD
BEGIN;
CREATE TYPE "VaultProvider_new" AS ENUM ('BLINKCLOUD', 'FILESYSTEM', 'NETWORK_ATTACHED_STORAGE', 'AMAZON_S3', 'S3_COMPATIBLE', 'GOOGLE_CLOUD_STORAGE', 'BACKBLAZE', 'AZURE_BLOB_STORAGE', 'SFTP', 'RCLONE', 'WEBDAV');
ALTER TABLE "Vault" ALTER COLUMN "provider" TYPE "VaultProvider_new" USING ("provider"::text::"VaultProvider_new");
ALTER TYPE "VaultProvider" RENAME TO "VaultProvider_old";
ALTER TYPE "VaultProvider_new" RENAME TO "VaultProvider";
DROP TYPE "VaultProvider_old";
COMMIT;
