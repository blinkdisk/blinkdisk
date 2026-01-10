-- Replace "strg_" prefix with "vlt_" prefix in all Vault.id values
-- The Config.vaultId foreign key has ON UPDATE CASCADE, so it will be updated automatically
UPDATE "Vault"
SET "id" = 'vlt_' || SUBSTRING("id" FROM 6)
WHERE "id" LIKE 'strg_%';