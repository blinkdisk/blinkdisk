-- Add the column as nullable first
ALTER TABLE "Storage" ADD COLUMN "name" TEXT;

-- Backfill the name from the latest non-deleted Vault for each Storage
UPDATE "Storage"
SET "name" = (
  SELECT "Vault"."name"
  FROM "Vault"
  WHERE "Vault"."storageId" = "Storage"."id"
    AND "Vault"."status" != 'DELETED'
  ORDER BY "Vault"."createdAt" DESC
  LIMIT 1
);

-- Make the column NOT NULL
ALTER TABLE "Storage" ALTER COLUMN "name" SET NOT NULL;
