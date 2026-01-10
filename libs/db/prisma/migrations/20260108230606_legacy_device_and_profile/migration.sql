-- Add the hostName and userName columns to Config table
ALTER TABLE "Config" ADD COLUMN     "hostName" TEXT,
ADD COLUMN     "userName" TEXT;

-- Populate the hostName and userName columns
UPDATE "Config"
SET "userName" = (
  SELECT "Profile"."userName"
  FROM "Profile"
  WHERE "Profile"."id" = "Config"."profileId"
  LIMIT 1
),
"hostName" = (
  SELECT "Device"."hostName"
  FROM "Profile"
  INNER JOIN "Device" ON "Device"."id" = "Profile"."deviceId"
  WHERE "Profile"."id" = "Config"."profileId"
  LIMIT 1
);

-- Remove the profileId column
ALTER TABLE "Config" DROP CONSTRAINT "Config_profileId_fkey";
ALTER TABLE "Config" DROP COLUMN "profileId";

-- Rename the Profile table to LegacyProfile
ALTER TABLE "Profile" RENAME TO "LegacyProfile";
ALTER TABLE "LegacyProfile" RENAME CONSTRAINT "Profile_pkey" TO "LegacyProfile_pkey";
ALTER TABLE "LegacyProfile" RENAME CONSTRAINT "Profile_accountId_fkey" TO "LegacyProfile_accountId_fkey";
ALTER TABLE "LegacyProfile" RENAME CONSTRAINT "Profile_deviceId_fkey" TO "LegacyProfile_deviceId_fkey";
ALTER INDEX "Profile_userName_idx" RENAME TO "LegacyProfile_userName_idx";

-- Rename the Device table to LegacyDevice
ALTER TABLE "Device" RENAME TO "LegacyDevice";
ALTER TABLE "LegacyDevice" RENAME CONSTRAINT "Device_pkey" TO "LegacyDevice_pkey";
ALTER TABLE "LegacyDevice" RENAME CONSTRAINT "Device_accountId_fkey" TO "LegacyDevice_accountId_fkey";
ALTER INDEX "Device_machineId_idx" RENAME TO "LegacyDevice_machineId_idx";
