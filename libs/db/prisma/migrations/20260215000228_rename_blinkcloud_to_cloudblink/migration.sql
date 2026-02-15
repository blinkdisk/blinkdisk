-- Both BLINKCLOUD and CLOUDBLINK
BEGIN;
CREATE TYPE "VaultProvider_new" AS ENUM ('BLINKCLOUD', 'CLOUDBLINK', 'FILESYSTEM', 'NETWORK_ATTACHED_STORAGE', 'AMAZON_S3', 'S3_COMPATIBLE', 'GOOGLE_CLOUD_STORAGE', 'BACKBLAZE', 'AZURE_BLOB_STORAGE', 'SFTP', 'RCLONE', 'WEBDAV');
ALTER TABLE "Vault" ALTER COLUMN "provider" TYPE "VaultProvider_new" USING ("provider"::text::"VaultProvider_new");
ALTER TYPE "VaultProvider" RENAME TO "VaultProvider_old";
ALTER TYPE "VaultProvider_new" RENAME TO "VaultProvider";
DROP TYPE "VaultProvider_old";
COMMIT;

-- Update rows from BLINKDISK_CLOUD to BLINKCLOUD
UPDATE "Vault" SET "provider" = 'CLOUDBLINK' WHERE "provider" = 'BLINKCLOUD';

-- Remove BLINKDISK_CLOUD
BEGIN;
CREATE TYPE "VaultProvider_new" AS ENUM ('CLOUDBLINK', 'FILESYSTEM', 'NETWORK_ATTACHED_STORAGE', 'AMAZON_S3', 'S3_COMPATIBLE', 'GOOGLE_CLOUD_STORAGE', 'BACKBLAZE', 'AZURE_BLOB_STORAGE', 'SFTP', 'RCLONE', 'WEBDAV');
ALTER TABLE "Vault" ALTER COLUMN "provider" TYPE "VaultProvider_new" USING ("provider"::text::"VaultProvider_new");
ALTER TYPE "VaultProvider" RENAME TO "VaultProvider_old";
ALTER TYPE "VaultProvider_new" RENAME TO "VaultProvider";
DROP TYPE "VaultProvider_old";
COMMIT;
