-- CreateEnum
CREATE TYPE "BatchCollectStatus" AS ENUM ('COMPLETED', 'PARTIAL', 'FAILED');

-- CreateTable
CREATE TABLE "batch_collects" (
    "id" TEXT NOT NULL,
    "globalWalletId" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "totalCollected" DECIMAL(20,8) NOT NULL,
    "walletsCount" INTEGER NOT NULL,
    "status" "BatchCollectStatus" NOT NULL DEFAULT 'COMPLETED',
    "txHashes" TEXT[],
    "executedBy" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_collects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "batch_collects_globalWalletId_idx" ON "batch_collects"("globalWalletId");

-- CreateIndex
CREATE INDEX "batch_collects_executedBy_idx" ON "batch_collects"("executedBy");

-- CreateIndex
CREATE INDEX "batch_collects_createdAt_idx" ON "batch_collects"("createdAt");

-- AddForeignKey
ALTER TABLE "batch_collects" ADD CONSTRAINT "batch_collects_globalWalletId_fkey" FOREIGN KEY ("globalWalletId") REFERENCES "global_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
