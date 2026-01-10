/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `Vault` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Vault" DROP COLUMN "passwordHash";
