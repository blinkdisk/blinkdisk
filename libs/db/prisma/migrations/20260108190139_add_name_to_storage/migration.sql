-- Add the column as nullable first
ALTER TABLE "Storage" ADD COLUMN "name" TEXT;

-- Backfill the name from the latest non-deleted Vault for each Storage
UPDATE "Storage"
SET "name" = COALESCE(
  (
    SELECT "Vault"."name"
    FROM "Vault"
    WHERE "Vault"."storageId" = "Storage"."id"
    ORDER BY "Vault"."createdAt" DESC
    LIMIT 1
  ),
  'Unnamed Vault'  -- fallback for name with no active vaults
);

-- Make the column NOT NULL
ALTER TABLE "Storage" ALTER COLUMN "name" SET NOT NULL;
