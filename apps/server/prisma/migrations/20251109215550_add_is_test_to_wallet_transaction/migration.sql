-- AlterTable
ALTER TABLE "wallet_transactions" ADD COLUMN "isTest" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "wallet_transactions_isTest_idx" ON "wallet_transactions"("isTest");
