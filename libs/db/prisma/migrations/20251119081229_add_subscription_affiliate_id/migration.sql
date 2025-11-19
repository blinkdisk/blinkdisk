-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "affiliateId" TEXT;

-- DropEnum
DROP TYPE "SubscriptionScheduledAction";
