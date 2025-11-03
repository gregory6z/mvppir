/**
 * Script to generate daily N0 commission for a specific user
 *
 * N0 commission = commission on user's own blocked balance (invested amount)
 * Rate depends on user's rank:
 * - RECRUIT: 0.35% daily
 * - BRONZE: 1.05% daily
 * - SILVER: 1.80% daily
 * - GOLD: 2.60% daily
 *
 * Usage:
 * npx tsx scripts/generate-daily-commission-n0.ts <email>
 *
 * Example:
 * npx tsx scripts/generate-daily-commission-n0.ts gregory10@gmail.com
 */

import { prisma } from "../src/lib/prisma"
import { getRankRequirements } from "../src/modules/mlm/mlm-config"

async function generateDailyCommissionN0(userEmail: string) {
  console.log(`\n🚀 Generating daily N0 commission for ${userEmail}...`)

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: {
      id: true,
      email: true,
      name: true,
      currentRank: true,
      blockedBalance: true,
      status: true,
    },
  })

  if (!user) {
    console.error(`\n❌ User not found: ${userEmail}`)
    process.exit(1)
  }

  if (user.status !== "ACTIVE") {
    console.error(`\n❌ User is not ACTIVE (status: ${user.status})`)
    process.exit(1)
  }

  if (user.blockedBalance.lte(0)) {
    console.error(`\n❌ User has no blocked balance (invested amount: $${user.blockedBalance})`)
    process.exit(1)
  }

  // Get commission rate for user's rank
  const rankConfig = getRankRequirements(user.currentRank)
  const n0Rate = rankConfig.commissions.N0 // % daily

  // Calculate commission amount
  const baseAmount = parseFloat(user.blockedBalance.toString())
  const finalAmount = (baseAmount * n0Rate) / 100

  console.log(`\n📊 User Information:`)
  console.log(`   Name: ${user.name}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Rank: ${user.currentRank}`)
  console.log(`   Blocked Balance: $${baseAmount.toFixed(2)}`)
  console.log(`   N0 Rate: ${n0Rate}% daily`)
  console.log(`   Commission Amount: $${finalAmount.toFixed(2)}`)

  // Create N0 commission
  const commission = await prisma.commission.create({
    data: {
      userId: user.id,
      fromUserId: user.id, // N0 = próprio usuário
      level: 0, // N0
      baseAmount,
      percentage: n0Rate,
      finalAmount,
      referenceDate: new Date(),
      status: "PAID",
      paidAt: new Date(),
    },
  })

  console.log(`\n✅ Commission created successfully!`)
  console.log(`   Commission ID: ${commission.id}`)
  console.log(`   Amount: $${commission.finalAmount.toFixed(2)}`)
  console.log(`   Status: ${commission.status}`)
  console.log(`   Date: ${commission.referenceDate.toISOString()}`)

  // Show user's total commissions
  const totalCommissions = await prisma.commission.aggregate({
    where: {
      userId: user.id,
      status: "PAID",
    },
    _sum: {
      finalAmount: true,
    },
    _count: true,
  })

  console.log(`\n📈 User's Total Commissions:`)
  console.log(`   Total Paid: $${totalCommissions._sum.finalAmount?.toFixed(2) || "0.00"}`)
  console.log(`   Total Count: ${totalCommissions._count}`)
}

// Get email from command line argument
const userEmail = process.argv[2]

if (!userEmail) {
  console.error("\n❌ Error: User email is required")
  console.log("\nUsage: npx tsx scripts/generate-daily-commission-n0.ts <email>")
  console.log("Example: npx tsx scripts/generate-daily-commission-n0.ts gregory10@gmail.com")
  process.exit(1)
}

// Run script
generateDailyCommissionN0(userEmail)
  .then(() => {
    console.log("\n✅ Done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Error:", error.message)
    process.exit(1)
  })
