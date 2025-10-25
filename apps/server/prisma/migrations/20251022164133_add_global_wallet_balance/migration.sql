-- CreateTable
CREATE TABLE "global_wallet_balances" (
    "id" TEXT NOT NULL,
    "globalWalletId" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "tokenAddress" TEXT,
    "balance" DECIMAL(20,8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_wallet_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "global_wallet_balances_globalWalletId_idx" ON "global_wallet_balances"("globalWalletId");

-- CreateIndex
CREATE UNIQUE INDEX "global_wallet_balances_globalWalletId_tokenSymbol_key" ON "global_wallet_balances"("globalWalletId", "tokenSymbol");

-- AddForeignKey
ALTER TABLE "global_wallet_balances" ADD CONSTRAINT "global_wallet_balances_globalWalletId_fkey" FOREIGN KEY ("globalWalletId") REFERENCES "global_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
