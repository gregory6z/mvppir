-- CreateEnum
CREATE TYPE "MLMRank" AS ENUM ('RECRUIT', 'BRONZE', 'SILVER', 'GOLD');

-- CreateEnum
CREATE TYPE "RankStatus" AS ENUM ('ACTIVE', 'WARNING', 'TEMPORARY_DOWNRANK', 'DOWNRANKED');

-- CreateEnum
CREATE TYPE "LoyaltyTier" AS ENUM ('NORMAL', 'FAITHFUL', 'LOYAL', 'VETERAN');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "blockedBalance" DECIMAL(20,2) NOT NULL DEFAULT 0,
ADD COLUMN     "currentRank" "MLMRank" NOT NULL DEFAULT 'RECRUIT',
ADD COLUMN     "gracePeriodEndsAt" TIMESTAMP(3),
ADD COLUMN     "lastWithdrawalAt" TIMESTAMP(3),
ADD COLUMN     "lifetimeVolume" DECIMAL(20,2) NOT NULL DEFAULT 0,
ADD COLUMN     "loyaltyTier" "LoyaltyTier" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "originalRank" "MLMRank",
ADD COLUMN     "rankConqueredAt" TIMESTAMP(3),
ADD COLUMN     "rankStatus" "RankStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "referrerId" TEXT,
ADD COLUMN     "totalDirects" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "warningCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "withdrawalCount30d" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "withdrawals" ADD COLUMN     "baseFee" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "gasFee" DECIMAL(10,8) NOT NULL DEFAULT 0,
ADD COLUMN     "loyaltyDiscount" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "loyaltyTier" "LoyaltyTier",
ADD COLUMN     "netAmount" DECIMAL(20,8) NOT NULL DEFAULT 0,
ADD COLUMN     "progressiveFee" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "rank" "MLMRank",
ADD COLUMN     "withdrawalNumber" INTEGER;

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "baseAmount" DECIMAL(20,8) NOT NULL,
    "level" INTEGER NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "finalAmount" DECIMAL(20,8) NOT NULL,
    "referenceDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "activeDirects" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "metRequirements" BOOLEAN NOT NULL DEFAULT false,
    "rankAtStart" "MLMRank" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commissions_userId_referenceDate_idx" ON "commissions"("userId", "referenceDate");

-- CreateIndex
CREATE INDEX "commissions_status_idx" ON "commissions"("status");

-- CreateIndex
CREATE INDEX "commissions_fromUserId_idx" ON "commissions"("fromUserId");

-- CreateIndex
CREATE INDEX "monthly_stats_userId_idx" ON "monthly_stats"("userId");

-- CreateIndex
CREATE INDEX "monthly_stats_year_month_idx" ON "monthly_stats"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_stats_userId_year_month_key" ON "monthly_stats"("userId", "year", "month");

-- CreateIndex
CREATE INDEX "users_referrerId_idx" ON "users"("referrerId");

-- CreateIndex
CREATE INDEX "users_currentRank_idx" ON "users"("currentRank");

-- CreateIndex
CREATE INDEX "users_rankStatus_idx" ON "users"("rankStatus");

-- CreateIndex
CREATE INDEX "withdrawals_userId_status_idx" ON "withdrawals"("userId", "status");

-- CreateIndex
CREATE INDEX "withdrawals_status_createdAt_idx" ON "withdrawals"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_stats" ADD CONSTRAINT "monthly_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
