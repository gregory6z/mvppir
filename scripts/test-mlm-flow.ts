/**
 * Test MLM Flow - Complete End-to-End Test
 *
 * Creates test users, simulates deposits, and tests rank progression.
 *
 * Usage:
 *   npx tsx scripts/test-mlm-flow.ts
 */

import { prisma } from "../src/lib/prisma";
import { hash } from "bcrypt";
import { Decimal } from "@prisma/client/runtime/library";
import { Wallet } from "ethers";
import { encryptPrivateKey } from "../src/lib/encryption";

async function main() {
  console.log("🧪 Starting MLM v1.0 End-to-End Test\n");

  // ===== Step 1: Create Sponsor User =====
  console.log("📝 Step 1: Creating sponsor user...");

  const sponsorPassword = await hash("password123", 10);

  const sponsor = await prisma.user.upsert({
    where: { email: "sponsor@test.com" },
    create: {
      email: "sponsor@test.com",
      name: "Sponsor User",
      emailVerified: true,
      status: "INACTIVE", // Will activate after $100 deposit
      accounts: {
        create: {
          id: `email-sponsor-${Date.now()}`,
          accountId: "sponsor@test.com",
          providerId: "credential",
          password: sponsorPassword,
        },
      },
    },
    update: {},
  });

  console.log(`✅ Sponsor created: ${sponsor.name} (${sponsor.email})`);

  // ===== Step 2: Create Deposit Address for Sponsor =====
  console.log("\n🔑 Step 2: Creating deposit address for sponsor...");

  let sponsorAddress = await prisma.depositAddress.findUnique({
    where: { userId: sponsor.id },
  });

  if (!sponsorAddress) {
    const wallet = Wallet.createRandom();
    const encryptedKey = encryptPrivateKey(wallet.privateKey);

    sponsorAddress = await prisma.depositAddress.create({
      data: {
        userId: sponsor.id,
        polygonAddress: wallet.address.toLowerCase(),
        privateKey: encryptedKey,
        status: "ACTIVE",
      },
    });

    console.log(`✅ Deposit address created: ${sponsorAddress.polygonAddress}`);
  } else {
    console.log(`✅ Using existing address: ${sponsorAddress.polygonAddress}`);
  }

  // ===== Step 3: Simulate Deposits for Sponsor =====
  console.log("\n💰 Step 3: Simulating deposits for sponsor...");

  // Deposit 1: $100 (activate account)
  await simulateDeposit(sponsor.id, sponsorAddress.id, 100, "USDC");
  console.log(`  ✅ Deposited $100 USDC (account activation)`);

  // Deposit 2: $400 (total $500 - meet BRONZE blocked balance requirement)
  await simulateDeposit(sponsor.id, sponsorAddress.id, 400, "USDC");
  console.log(`  ✅ Deposited $400 USDC (total: $500)`);

  // Update lifetimeVolume and blockedBalance
  await prisma.user.update({
    where: { id: sponsor.id },
    data: {
      lifetimeVolume: 500,
      blockedBalance: 500,
      status: "ACTIVE",
      activatedAt: new Date(),
    },
  });

  console.log(`  ✅ Sponsor activated and balances updated`);

  // ===== Step 4: Create 3 Direct Referrals =====
  console.log("\n👥 Step 4: Creating 3 direct referrals (N1)...");

  const directs = [];

  for (let i = 1; i <= 3; i++) {
    const password = await hash("password123", 10);

    const direct = await prisma.user.upsert({
      where: { email: `direct${i}@test.com` },
      create: {
        email: `direct${i}@test.com`,
        name: `Direct ${i}`,
        emailVerified: true,
        status: "INACTIVE",
        referrerId: sponsor.id, // Link to sponsor
        accounts: {
          create: {
            id: `email-direct${i}-${Date.now()}`,
            accountId: `direct${i}@test.com`,
            providerId: "credential",
            password,
          },
        },
      },
      update: {
        referrerId: sponsor.id, // Ensure referrer is set
      },
    });

    // Create deposit address
    let directAddress = await prisma.depositAddress.findUnique({
      where: { userId: direct.id },
    });

    if (!directAddress) {
      const wallet = Wallet.createRandom();
      const encryptedKey = encryptPrivateKey(wallet.privateKey);

      directAddress = await prisma.depositAddress.create({
        data: {
          userId: direct.id,
          polygonAddress: wallet.address.toLowerCase(),
          privateKey: encryptedKey,
          status: "ACTIVE",
        },
      });
    }

    // Deposit $100 (activate account)
    await simulateDeposit(direct.id, directAddress.id, 100, "USDC");

    // Update user
    await prisma.user.update({
      where: { id: direct.id },
      data: {
        status: "ACTIVE",
        activatedAt: new Date(),
        lifetimeVolume: 100,
        blockedBalance: 100,
      },
    });

    directs.push(direct);

    console.log(`  ✅ Direct ${i} created and activated: ${direct.email}`);
  }

  // ===== Step 5: Update Sponsor Network Stats =====
  console.log("\n📊 Step 5: Updating sponsor network stats...");

  await prisma.user.update({
    where: { id: sponsor.id },
    data: {
      totalDirects: 3, // 3 direct referrals
      lifetimeVolume: 500 + 3 * 100, // $500 (sponsor) + $300 (3 directs)
    },
  });

  console.log(`  ✅ Sponsor now has 3 directs, lifetime volume: $800`);

  // ===== Step 6: Check Rank Progression =====
  console.log("\n🎖️  Step 6: Checking rank progression...");

  const { autoCheckAndPromote } = await import("../src/modules/mlm/use-cases/check-rank-progression");
  const promoted = await autoCheckAndPromote(sponsor.id);

  if (promoted) {
    const updatedSponsor = await prisma.user.findUnique({
      where: { id: sponsor.id },
      select: { currentRank: true },
    });

    console.log(`  🎉 Sponsor promoted to: ${updatedSponsor?.currentRank}!`);
  } else {
    console.log(`  ⏳ Sponsor doesn't meet requirements for BRONZE yet`);

    // Check what's missing
    const { getMissingRequirements } = await import("../src/modules/mlm/use-cases/calculate-rank-requirements");
    const missing = await getMissingRequirements(sponsor.id, "BRONZE");

    console.log(`  Missing requirements for BRONZE:`);
    missing.forEach((req) => console.log(`    - ${req}`));
  }

  // ===== Step 7: Show Final Profile =====
  console.log("\n📈 Step 7: Final MLM Profile...");

  const { getUserMLMProfile } = await import("../src/modules/mlm/use-cases/get-user-mlm-profile");
  const profile = await getUserMLMProfile(sponsor.id);

  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  USER: ${profile.user.name} (${profile.user.email})`);
  console.log(`═══════════════════════════════════════════════════`);
  console.log(`  Current Rank: ${profile.user.currentRank}`);
  console.log(`  Rank Status: ${profile.user.rankStatus}`);
  console.log(`  Blocked Balance: $${profile.user.blockedBalance}`);
  console.log(`  Loyalty Tier: ${profile.user.loyaltyTier}`);
  console.log(`\n  Network:`);
  console.log(`    Total Directs: ${profile.network.totalDirects}`);
  console.log(`    Active Directs: ${profile.network.activeDirects}`);
  console.log(`    Lifetime Volume: $${profile.network.lifetimeVolume}`);
  console.log(`\n  Network Levels:`);
  console.log(`    N1: ${profile.network.levels.N1.count} users, $${profile.network.levels.N1.totalBalance}`);
  console.log(`    N2: ${profile.network.levels.N2.count} users, $${profile.network.levels.N2.totalBalance}`);
  console.log(`    N3: ${profile.network.levels.N3.count} users, $${profile.network.levels.N3.totalBalance}`);
  console.log(`\n  Commission Rates:`);
  console.log(`    N1: ${profile.commissionRates.N1}%`);
  console.log(`    N2: ${profile.commissionRates.N2}%`);
  console.log(`    N3: ${profile.commissionRates.N3}%`);

  if (profile.nextRankPreview) {
    console.log(`\n  Next Rank: ${profile.nextRankPreview.rank}`);
    console.log(`  Can Progress: ${profile.nextRankPreview.canProgress ? "Yes ✅" : "No ❌"}`);

    if (profile.nextRankPreview.missingRequirements.length > 0) {
      console.log(`  Missing:`);
      profile.nextRankPreview.missingRequirements.forEach((req) =>
        console.log(`    - ${req}`)
      );
    }
  }

  console.log(`═══════════════════════════════════════════════════`);

  console.log("\n✅ MLM Flow Test Completed!\n");
  console.log("📝 Summary:");
  console.log(`  - Sponsor: ${sponsor.email} (Rank: ${profile.user.currentRank})`);
  console.log(`  - Directs: 3 active users`);
  console.log(`  - Total network: 3 users`);
  console.log(`  - Lifetime volume: $${profile.network.lifetimeVolume}`);
  console.log("\n🎯 Next steps:");
  console.log("  1. Start the server: npm run dev");
  console.log("  2. Access Bull Board: http://localhost:3333/admin/queues");
  console.log("  3. Login as sponsor: sponsor@test.com / password123");
  console.log("  4. Check MLM profile: GET /mlm/profile");
}

/**
 * Helper: Simulate a deposit transaction
 */
async function simulateDeposit(
  userId: string,
  depositAddressId: string,
  amount: number,
  tokenSymbol: string
) {
  const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

  // Create transaction
  await prisma.walletTransaction.create({
    data: {
      userId,
      depositAddressId,
      type: "CREDIT",
      tokenSymbol,
      tokenAddress:
        tokenSymbol === "USDC"
          ? "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
          : null,
      tokenDecimals: tokenSymbol === "USDC" ? 6 : 18,
      amount: new Decimal(amount),
      rawAmount:
        tokenSymbol === "USDC"
          ? (amount * 1_000_000).toString()
          : (amount * 1_000_000_000_000_000_000).toString(),
      txHash,
      status: "CONFIRMED",
    },
  });

  // Update balance
  await prisma.balance.upsert({
    where: {
      userId_tokenSymbol: {
        userId,
        tokenSymbol,
      },
    },
    create: {
      userId,
      tokenSymbol,
      tokenAddress:
        tokenSymbol === "USDC"
          ? "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
          : null,
      availableBalance: new Decimal(amount),
      lockedBalance: 0,
    },
    update: {
      availableBalance: {
        increment: new Decimal(amount),
      },
    },
  });
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
