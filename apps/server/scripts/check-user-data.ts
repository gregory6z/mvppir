import { prisma } from "../src/lib/prisma"

async function checkUserData() {
  const userEmail = "gregory10@gmail.com"

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      currentRank: true,
      blockedBalance: true,
      totalDirects: true,
      lifetimeVolume: true,
    },
  })

  if (!user) {
    console.log("User not found:", userEmail)
    return
  }

  console.log("\n👤 Main User:")
  console.log("   Email:", user.email)
  console.log("   Status:", user.status)
  console.log("   Rank:", user.currentRank)
  console.log("   Blocked Balance:", user.blockedBalance.toString())
  console.log("   Total Directs:", user.totalDirects)
  console.log("   Lifetime Volume:", user.lifetimeVolume.toString())

  // Find referrals
  const referrals = await prisma.user.findMany({
    where: { referrerId: user.id },
    select: {
      name: true,
      email: true,
      status: true,
      currentRank: true,
      blockedBalance: true,
    },
  })

  console.log("\n📊 Referrals (" + referrals.length + "):")
  referrals.forEach((ref) => {
    console.log("   -", ref.name)
    console.log("     Status:", ref.status)
    console.log("     Blocked Balance:", ref.blockedBalance.toString())
  })

  // Check commissions
  const commissions = await prisma.commission.findMany({
    where: { userId: user.id, status: "PAID" },
    select: {
      level: true,
      baseAmount: true,
      percentage: true,
      finalAmount: true,
    },
  })

  console.log("\n💰 Commissions (" + commissions.length + "):")
  commissions.forEach((c) => {
    console.log("   Level:", c.level)
    console.log("   Base:", c.baseAmount.toString())
    console.log("   Rate:", c.percentage, "%")
    console.log("   Amount:", c.finalAmount.toString())
    console.log("")
  })

  const totalCommissions = commissions.reduce(
    (sum, c) => sum + parseFloat(c.finalAmount.toString()),
    0
  )
  console.log("   Total:", totalCommissions.toFixed(2))
}

checkUserData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error)
    process.exit(1)
  })
