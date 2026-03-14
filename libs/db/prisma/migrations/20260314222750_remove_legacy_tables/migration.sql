/*
  Warnings:

  - You are about to drop the `LegacyDevice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LegacyProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LegacyDevice" DROP CONSTRAINT "LegacyDevice_accountId_fkey";

-- DropForeignKey
ALTER TABLE "LegacyProfile" DROP CONSTRAINT "LegacyProfile_accountId_fkey";

-- DropForeignKey
ALTER TABLE "LegacyProfile" DROP CONSTRAINT "LegacyProfile_deviceId_fkey";

-- DropTable
DROP TABLE "LegacyDevice";

-- DropTable
DROP TABLE "LegacyProfile";
