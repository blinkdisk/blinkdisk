--  Add the column as nullable
ALTER TABLE "Vault" ADD COLUMN "coreId" TEXT;

-- Backfill the coreId field by replacing "vlt_" prefix with "strg_" in the id field
UPDATE "Vault" SET "coreId" = REPLACE("id", 'vlt_', 'strg_');

-- Make the column required (NOT NULL)
ALTER TABLE "Vault" ALTER COLUMN "coreId" SET NOT NULL;
