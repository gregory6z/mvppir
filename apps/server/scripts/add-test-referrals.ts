/**
 * Script to add test referrals and deposits
 *
 * Usage:
 * npx tsx scripts/add-test-referrals.ts YOUR_USER_EMAIL
 */

import { prisma } from "../src/lib/prisma"
import { encryptPrivateKey } from "../src/lib/encryption"
import { Wallet } from "ethers"

async function addTestReferrals(userEmail: string) {
  console.log(`\n🔍 Finding user: ${userEmail}`)

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: {
      id: true,
      name: true,
      email: true,
      referralCode: true,
    },
  })

  if (!user) {
    console.error(`❌ User not found: ${userEmail}`)
    process.exit(1)
  }

  console.log(`✅ Found user: ${user.name} (${user.email})`)
  console.log(`   Referral code: ${user.referralCode}`)

  // Create 2 direct referrals
  const referrals = [
    {
      name: "Carlos Mendes",
      email: `carlos.mendes.${Date.now()}@test.com`,
      depositAmount: 500, // $500
    },
    {
      name: "Ana Costa",
      email: `ana.costa.${Date.now() + 1}@test.com`,
      depositAmount: 1000, // $1000
    },
  ]

  console.log(`\n🚀 Creating ${referrals.length} referrals...`)

  for (const referral of referrals) {
    console.log(`\n📝 Creating referral: ${referral.name}`)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: referral.email },
    })

    if (existingUser) {
      console.log(`   ⚠️  User already exists, skipping...`)
      continue
    }

    // Generate wallet for referral
    const wallet = Wallet.createRandom()
    const address = wallet.address.toLowerCase()
    const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey)

    // Generate unique referral code
    const referralCode = `${referral.name.split(" ")[0].toUpperCase()}${Math.floor(Math.random() * 1000)}`

    // Create referral user
    const newUser = await prisma.user.create({
      data: {
        name: referral.name,
        email: referral.email,
        emailVerified: true,
        status: "ACTIVE",
        currentRank: "RECRUIT",
        rankStatus: "ACTIVE",
        referralCode,
        referrerId: user.id, // Link to main user
        blockedBalance: referral.depositAmount, // Auto-block on deposit
        totalDirects: 0,
        lifetimeVolume: 0,
      },
    })

    console.log(`   ✅ User created: ${newUser.id}`)

    // Create deposit address
    const depositAddress = await prisma.depositAddress.create({
      data: {
        userId: newUser.id,
        polygonAddress: address,
        privateKey: encryptedPrivateKey,
      },
    })

    console.log(`   ✅ Deposit address: ${depositAddress.polygonAddress}`)

    // Create deposit transaction (USDC)
    const transaction = await prisma.walletTransaction.create({
      data: {
        userId: newUser.id,
        depositAddressId: depositAddress.id,
        txHash: `0x${Math.random().toString(16).substring(2, 66)}`, // Fake hash
        tokenSymbol: "USDC",
        tokenAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC on Polygon
        tokenDecimals: 6,
        amount: referral.depositAmount,
        rawAmount: (referral.depositAmount * 1_000_000).toString(), // USDC has 6 decimals
        type: "CREDIT",
        status: "CONFIRMED",
      },
    })

    console.log(`   ✅ Transaction created: ${transaction.txHash}`)

    // Create balance entry
    await prisma.balance.create({
      data: {
        userId: newUser.id,
        tokenSymbol: "USDC",
        tokenAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC on Polygon
        availableBalance: 0, // All blocked
        lockedBalance: 0,
      },
    })

    console.log(`   ✅ Balance created (all funds auto-blocked)`)

    // Update main user's totalDirects and lifetimeVolume
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalDirects: { increment: 1 },
        lifetimeVolume: { increment: referral.depositAmount },
      },
    })

    console.log(`   ✅ Main user stats updated`)

    // Create commission for the main user (N1 commission from this referral's blocked balance)
    // Commission rate depends on main user's rank
    const mainUserData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { currentRank: true },
    })

    // Get commission rate for N1 based on rank
    const commissionRates: Record<string, number> = {
      RECRUIT: 0.10, // 0.10% daily on N1 balance
      BRONZE: 0.30,  // 0.30% daily on N1 balance
      SILVER: 0.50,  // 0.50% daily on N1 balance
      GOLD: 0.70,    // 0.70% daily on N1 balance
    }

    const rate = commissionRates[mainUserData?.currentRank || "RECRUIT"]
    const commissionAmount = (referral.depositAmount * rate) / 100

    // Create commission record
    const commission = await prisma.commission.create({
      data: {
        userId: user.id, // Main user receives the commission
        fromUserId: newUser.id, // From the referral
        level: 1, // N1 (direct referral)
        baseAmount: referral.depositAmount, // Referral's blocked balance
        percentage: rate, // Commission percentage
        finalAmount: commissionAmount, // Calculated commission
        referenceDate: new Date(),
        status: "PAID", // Mark as paid
        paidAt: new Date(),
      },
    })

    console.log(`   ✅ Commission created: $${commissionAmount.toFixed(2)} (${rate}% of $${referral.depositAmount})`)
  }

  // Show final summary
  console.log(`\n📊 Summary:`)
  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      totalDirects: true,
      lifetimeVolume: true,
      blockedBalance: true,
      currentRank: true,
    },
  })

  const totalCommissions = await prisma.commission.aggregate({
    where: {
      userId: user.id,
      status: "PAID",
    },
    _sum: {
      finalAmount: true,
    },
  })

  console.log(`   Current Rank: ${updatedUser?.currentRank}`)
  console.log(`   Total Directs: ${updatedUser?.totalDirects}`)
  console.log(`   Lifetime Volume: $${updatedUser?.lifetimeVolume}`)
  console.log(`   Blocked Balance: $${updatedUser?.blockedBalance}`)
  console.log(`   Total Commissions Earned: $${totalCommissions._sum.finalAmount?.toFixed(2) || "0.00"}`)

  console.log(`\n✅ Done! Check your app to see the referrals and commissions.`)
}

// Run script
const userEmail = process.argv[2]

if (!userEmail) {
  console.error("❌ Usage: npx tsx scripts/add-test-referrals.ts YOUR_USER_EMAIL")
  process.exit(1)
}

addTestReferrals(userEmail)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error)
    process.exit(1)
  })
