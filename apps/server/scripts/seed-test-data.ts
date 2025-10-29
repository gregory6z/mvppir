import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🧹 Cleaning existing data...");

  // Get specific user: gregory10@gmail.com
  const user = await prisma.user.findFirst({
    where: { email: "gregory10@gmail.com" },
  });

  if (!user) {
    console.error("❌ User gregory10@gmail.com not found.");
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.name} (${user.email})`);

  // Delete all existing transactions and commissions for this user
  await prisma.walletTransaction.deleteMany({
    where: { userId: user.id },
  });
  await prisma.commission.deleteMany({
    where: { userId: user.id },
  });
  await prisma.balance.deleteMany({
    where: { userId: user.id },
  });

  console.log("🗑️  Deleted all existing transactions, commissions, and balances");

  // Get or create deposit address for user
  let depositAddress = await prisma.depositAddress.findFirst({
    where: { userId: user.id },
  });

  if (!depositAddress) {
    console.log("📍 Creating deposit address...");
    depositAddress = await prisma.depositAddress.create({
      data: {
        userId: user.id,
        polygonAddress: "0x" + "1".repeat(40), // Fake address
        privateKey: "encrypted_fake_key",
        createdAt: new Date(),
      },
    });
  }

  console.log(`✅ Using deposit address: ${depositAddress.polygonAddress}`);

  // Create a $500 USDT deposit (60 days ago, to span 2 months)
  const depositAmount = 500;
  const depositDate = new Date();
  depositDate.setDate(depositDate.getDate() - 60); // 60 days ago
  depositDate.setHours(10, 0, 0, 0); // 10:00 AM

  // Generate unique hashes based on user ID
  const uniqueTxHash = "0x" + user.id.substring(0, 8) + "a".repeat(56);
  const uniqueTransferHash = "0x" + user.id.substring(0, 8) + "b".repeat(56);

  await prisma.walletTransaction.create({
    data: {
      userId: user.id,
      depositAddressId: depositAddress.id,
      type: "CREDIT",
      tokenSymbol: "USDT",
      tokenAddress: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      tokenDecimals: 6, // USDT has 6 decimals
      amount: depositAmount,
      rawAmount: (depositAmount * 1_000_000).toString(), // USDT has 6 decimals
      txHash: uniqueTxHash,
      transferTxHash: uniqueTransferHash,
      status: "CONFIRMED",
      createdAt: depositDate,
    },
  });

  console.log(`💰 Created $${depositAmount} USDT deposit`);

  // Create balance for USDT
  await prisma.balance.create({
    data: {
      userId: user.id,
      tokenSymbol: "USDT",
      availableBalance: depositAmount,
      lockedBalance: 0,
    },
  });

  console.log("✅ Created USDT balance");

  // Create daily commissions for 60 days starting the day after deposit
  // Bronze level: 1.05% daily on $500 = $5.25/day
  const bronzeRate = 1.05; // 1.05%
  const dailyCommission = (depositAmount * bronzeRate) / 100; // $5.25

  console.log(`\n📈 Creating daily commissions (Bronze level: ${bronzeRate}%)`);
  console.log(`   Daily commission: $${dailyCommission.toFixed(2)}`);

  const commissionsCreated: any[] = [];

  // Create commissions starting 1 day after deposit, for 60 days (to span 2 months)
  for (let daysAfter = 1; daysAfter <= 60; daysAfter++) {
    const commissionDate = new Date(depositDate);
    commissionDate.setDate(commissionDate.getDate() + daysAfter);
    commissionDate.setHours(0, 30, 0, 0); // 00:30 AM (daily commission run)

    // Create commission (level 0 = self commission / daily yield)
    const commission = await prisma.commission.create({
      data: {
        userId: user.id,
        fromUserId: user.id, // Self commission (daily yield on own balance)
        baseAmount: depositAmount,
        level: 0, // 0 = self commission (daily yield)
        percentage: bronzeRate,
        finalAmount: dailyCommission,
        referenceDate: commissionDate,
        status: "PAID",
        paidAt: commissionDate,
        createdAt: commissionDate,
      },
    });

    commissionsCreated.push(commission);
  }

  console.log(`✅ Created ${commissionsCreated.length} daily commissions`);

  // Update balance with total commissions
  const totalCommissions = dailyCommission * 60;
  await prisma.balance.update({
    where: {
      userId_tokenSymbol: {
        userId: user.id,
        tokenSymbol: "USD", // Commissions are paid in USD
      },
    },
    data: {
      availableBalance: totalCommissions,
      lockedBalance: 0,
    },
  }).catch(async () => {
    // If doesn't exist, create it
    await prisma.balance.create({
      data: {
        userId: user.id,
        tokenSymbol: "USD",
        availableBalance: totalCommissions,
        lockedBalance: 0,
      },
    });
  });

  console.log(`✅ Updated USD balance with total commissions: $${totalCommissions.toFixed(2)}`);

  // Summary
  console.log("\n📊 Summary:");
  console.log(`   User: ${user.name} (${user.email})`);
  console.log(`   Deposit: $${depositAmount} USDT (60 days ago)`);
  console.log(`   Daily commissions: 60 days × $${dailyCommission.toFixed(2)} = $${totalCommissions.toFixed(2)}`);
  console.log(`   Total balance: $${(depositAmount + totalCommissions).toFixed(2)}`);
  console.log("\n✨ Done! Check your mobile app to see the data.");
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
