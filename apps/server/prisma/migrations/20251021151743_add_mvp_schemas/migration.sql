/*
  Warnings:

  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "DepositAddressStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SENT_TO_GLOBAL', 'FAILED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activatedAt" TIMESTAMP(3),
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'INACTIVE',
ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "deposit_addresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "polygonAddress" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "status" "DepositAddressStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposit_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "depositAddressId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "tokenAddress" TEXT,
    "tokenDecimals" INTEGER NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "rawAmount" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "transferTxHash" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_wallets" (
    "id" TEXT NOT NULL,
    "polygonAddress" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deposit_addresses_userId_key" ON "deposit_addresses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "deposit_addresses_polygonAddress_key" ON "deposit_addresses"("polygonAddress");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_txHash_key" ON "wallet_transactions"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_transferTxHash_key" ON "wallet_transactions"("transferTxHash");

-- CreateIndex
CREATE UNIQUE INDEX "global_wallets_polygonAddress_key" ON "global_wallets"("polygonAddress");

-- AddForeignKey
ALTER TABLE "deposit_addresses" ADD CONSTRAINT "deposit_addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_depositAddressId_fkey" FOREIGN KEY ("depositAddressId") REFERENCES "deposit_addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
