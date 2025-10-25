/**
 * Simulate Deposit Script
 *
 * Simula um depósito de USDC para testar o sistema MLM.
 *
 * Usage:
 *   npx tsx scripts/simulate-deposit.ts <userEmail> <amount>
 *
 * Example:
 *   npx tsx scripts/simulate-deposit.ts user@example.com 500
 */

import { prisma } from "../src/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("❌ Usage: npx tsx scripts/simulate-deposit.ts <userEmail> <amount>");
    console.error("   Example: npx tsx scripts/simulate-deposit.ts user@example.com 500");
    process.exit(1);
  }

  const [email, amountStr] = args;
  const amount = parseFloat(amountStr);

  if (isNaN(amount) || amount <= 0) {
    console.error("❌ Amount must be a positive number");
    process.exit(1);
  }

  console.log(`🔍 Looking for user: ${email}...`);

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      depositAddresses: true,
      balances: true,
    },
  });

  if (!user) {
    console.error(`❌ User not found: ${email}`);
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.name} (${user.id})`);

  // Check if user has deposit address
  if (!user.depositAddresses || user.depositAddresses.length === 0) {
    console.error("❌ User has no deposit address. Create one first!");
    process.exit(1);
  }

  const depositAddress = user.depositAddresses[0];
  console.log(`✅ Deposit address: ${depositAddress.polygonAddress}`);

  // Generate fake transaction hash
  const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

  console.log(`\n💰 Simulating deposit of ${amount} USDC...`);

  // Create WalletTransaction (CONFIRMED)
  const transaction = await prisma.walletTransaction.create({
    data: {
      userId: user.id,
      depositAddressId: depositAddress.id,
      type: "CREDIT",
      tokenSymbol: "USDC",
      tokenAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC Polygon
      tokenDecimals: 6,
      amount: new Decimal(amount),
      rawAmount: (amount * 1_000_000).toString(), // USDC has 6 decimals
      txHash,
      status: "CONFIRMED", // Already confirmed
    },
  });

  console.log(`✅ Transaction created: ${transaction.id}`);

  // Update Balance (atomic)
  const balance = await prisma.balance.upsert({
    where: {
      userId_tokenSymbol: {
        userId: user.id,
        tokenSymbol: "USDC",
      },
    },
    create: {
      userId: user.id,
      tokenSymbol: "USDC",
      tokenAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      availableBalance: new Decimal(amount),
      lockedBalance: 0,
    },
    update: {
      availableBalance: {
        increment: new Decimal(amount),
      },
    },
  });

  console.log(`✅ Balance updated: ${balance.availableBalance} USDC`);

  // Update lifetimeVolume (MLM)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lifetimeVolume: {
        increment: new Decimal(amount),
      },
    },
  });

  console.log(`✅ Lifetime volume updated`);

  // Check if user should be activated (>= $100)
  if (user.status === "INACTIVE") {
    const totalBalance = parseFloat(balance.availableBalance.toString());

    if (totalBalance >= 100) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          status: "ACTIVE",
          activatedAt: new Date(),
        },
      });

      console.log(`🎉 User ACTIVATED (balance >= $100)!`);
    } else {
      console.log(`⏳ User still INACTIVE (needs $${100 - totalBalance} more)`);
    }
  }

  // Check rank progression (MLM)
  console.log(`\n🎖️  Checking rank progression...`);

  try {
    const { autoCheckAndPromote } = await import("../src/modules/mlm/use-cases/check-rank-progression");
    const promoted = await autoCheckAndPromote(user.id);

    if (promoted) {
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { currentRank: true },
      });

      console.log(`✅ User promoted to rank: ${updatedUser?.currentRank}!`);
    } else {
      console.log(`⏳ User doesn't meet requirements for next rank yet`);
    }
  } catch (error) {
    console.error("⚠️  Error checking rank progression:", error);
  }

  console.log(`\n✅ Deposit simulation completed!`);
  console.log(`\nSummary:`);
  console.log(`  User: ${user.name} (${user.email})`);
  console.log(`  Amount: ${amount} USDC`);
  console.log(`  New Balance: ${balance.availableBalance} USDC`);
  console.log(`  TX Hash: ${txHash}`);
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
