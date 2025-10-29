import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

const USER_ID = "m5QnhkZESHA7QDShpc7IA8A3eMuyq1bX";

async function seedTransactions() {
  console.log("🌱 Seeding transactions for gregory10@gmail.com...\n");

  // Get or create deposit address
  let depositAddress = await prisma.depositAddress.findFirst({
    where: { userId: USER_ID },
  });

  if (!depositAddress) {
    console.log("📝 Creating deposit address...");
    const randomAddress = "0x" + Math.random().toString(16).substring(2, 42).padEnd(40, '0');
    depositAddress = await prisma.depositAddress.create({
      data: {
        userId: USER_ID,
        polygonAddress: randomAddress,
        privateKey: "encrypted_" + Math.random().toString(16).substring(2, 66),
      },
    });
    console.log(`✅ Created deposit address: ${depositAddress.polygonAddress}\n`);
  }

  const DEPOSIT_ADDRESS_ID = depositAddress.id;

  // Helper to generate random amounts
  const randomAmount = (min: number, max: number) => {
    return (Math.random() * (max - min) + min).toFixed(2);
  };

  // Helper to generate random dates in the last 30 days
  const randomDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    return date;
  };

  const transactions = [];
  const depositDates: Date[] = [];

  // 13 Deposits (CREDIT) - CONFIRMED
  for (let i = 0; i < 13; i++) {
    const amount = randomAmount(50, 500);
    const token = i % 3 === 0 ? "USDT" : i % 3 === 1 ? "USDC" : "MATIC";
    const decimals = token === "MATIC" ? 18 : 6;
    const rawAmount = new Decimal(amount).mul(new Decimal(10).pow(decimals));
    const depositDate = randomDate(Math.floor(Math.random() * 30));

    const tx = await prisma.walletTransaction.create({
      data: {
        userId: USER_ID,
        depositAddressId: DEPOSIT_ADDRESS_ID,
        type: "CREDIT",
        tokenSymbol: token,
        tokenAddress: token === "USDT"
          ? "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
          : token === "USDC"
          ? "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
          : "0x0000000000000000000000000000000000001010",
        tokenDecimals: decimals,
        amount: new Decimal(amount),
        rawAmount: rawAmount.toString(),
        txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        status: "CONFIRMED",
        createdAt: depositDate,
      },
    });

    depositDates.push(depositDate);
    transactions.push(tx);
    console.log(`✅ Deposit: +$${amount} ${token} (${tx.status})`);
  }

  // 7 Commissions - Mix of levels, using deposit dates
  const commissionLevels = [0, 1, 2, 3, 1, 2, 0]; // 0 = self, 1-3 = network levels

  for (let i = 0; i < 7; i++) {
    const level = commissionLevels[i];
    const amount = randomAmount(5, 50);
    const isSelf = level === 0;

    // Use a random deposit date + some minutes offset (commission happens shortly after deposit)
    const baseDate = depositDates[Math.floor(Math.random() * depositDates.length)];
    const commissionDate = new Date(baseDate);
    commissionDate.setMinutes(commissionDate.getMinutes() + Math.floor(Math.random() * 30)); // 0-30 minutes after

    const commission = await prisma.commission.create({
      data: {
        userId: USER_ID,
        fromUserId: USER_ID, // Simplified: all from self for now
        level: level,
        baseAmount: new Decimal(amount),
        percentage: level === 0 ? new Decimal("10") : level === 1 ? new Decimal("5") : level === 2 ? new Decimal("3") : new Decimal("2"),
        finalAmount: new Decimal(amount),
        status: "PAID", // Mark as paid so they show as confirmed
        paidAt: commissionDate,
        referenceDate: commissionDate,
        createdAt: commissionDate,
      },
    });

    transactions.push(commission);
    const levelLabel = isSelf ? "Self" : `N${level}`;
    console.log(`⭐ Commission (${levelLabel}): +$${amount} USD`);
  }

  // Update Balance for user
  const totalDeposits = transactions
    .filter((t: any) => t.type === "CREDIT")
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount.toString()), 0);

  const totalCommissions = transactions
    .filter((t: any) => t.finalAmount)
    .reduce((sum: number, t: any) => sum + parseFloat(t.finalAmount.toString()), 0);

  console.log("\n📊 Summary:");
  console.log(`   Deposits: $${totalDeposits.toFixed(2)}`);
  console.log(`   Commissions: $${totalCommissions.toFixed(2)}`);
  console.log(`   Total Balance: $${(totalDeposits + totalCommissions).toFixed(2)}`);

  // Update Balance table for USDT
  await prisma.balance.upsert({
    where: {
      userId_tokenSymbol: {
        userId: USER_ID,
        tokenSymbol: "USDT",
      },
    },
    create: {
      userId: USER_ID,
      tokenSymbol: "USDT",
      tokenAddress: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      availableBalance: new Decimal(totalDeposits * 0.4),
      lockedBalance: new Decimal(0),
    },
    update: {
      availableBalance: {
        increment: new Decimal(totalDeposits * 0.4),
      },
    },
  });

  // Update Balance table for USDC
  await prisma.balance.upsert({
    where: {
      userId_tokenSymbol: {
        userId: USER_ID,
        tokenSymbol: "USDC",
      },
    },
    create: {
      userId: USER_ID,
      tokenSymbol: "USDC",
      tokenAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      availableBalance: new Decimal(totalDeposits * 0.4),
      lockedBalance: new Decimal(0),
    },
    update: {
      availableBalance: {
        increment: new Decimal(totalDeposits * 0.4),
      },
    },
  });

  console.log("\n✅ Successfully created 20 transactions!");
  console.log("   - 13 Deposits (CONFIRMED)");
  console.log("   - 7 Commissions (all levels)");
}

seedTransactions()
  .catch((error) => {
    console.error("❌ Error seeding transactions:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
