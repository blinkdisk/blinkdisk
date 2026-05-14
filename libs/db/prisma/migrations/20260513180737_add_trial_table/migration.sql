/*
  Warnings:

  - A unique constraint covering the columns `[trialId]` on the table `Space` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TrialStatus" AS ENUM ('ACTIVE', 'ENDED');

-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "trialId" TEXT;

-- CreateTable
CREATE TABLE "Trial" (
    "id" TEXT NOT NULL,
    "status" "TrialStatus" NOT NULL DEFAULT 'ACTIVE',
    "capacity" BIGINT NOT NULL,
    "accountId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trial_accountId_key" ON "Trial"("accountId");

-- CreateIndex
CREATE INDEX "Trial_status_idx" ON "Trial"("status");

-- CreateIndex
CREATE INDEX "Trial_endsAt_idx" ON "Trial"("endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Space_trialId_key" ON "Space"("trialId");

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "Trial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trial" ADD CONSTRAINT "Trial_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
