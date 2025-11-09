import { PrismaClient } from "@prisma/client"
import { auth } from "../src/lib/auth"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // 1. Seed Global Wallet (encrypted private key)
  console.log("\n🔐 Seeding Global Wallet...")
  const existingWallet = await prisma.globalWallet.findFirst()

  if (existingWallet) {
    console.log(`⏭️  Global Wallet already exists (${existingWallet.polygonAddress}), skipping...`)
  } else {
    const globalWallet = await prisma.globalWallet.create({
      data: {
        polygonAddress: "0xb03e3afd7d9a2064d1fb2ccc5f4a42d7f695900f",
        privateKey: "d95435c0fa8b5e0b95c410573523a9b2:2b71a378765cd96c894e6a10960247b9:6488091a2e495f21ac81450d5a1866344483ba315f1146911fb85b48d596e7605ff4fd5b8709b3fa44b3711f80495a89f387d254cc286d88ca63a678064200861a89",
      },
    })
    console.log(`✅ Created Global Wallet: ${globalWallet.polygonAddress}`)
  }

  // 2. Seed Admin users with military code names
  console.log("\n👥 Seeding Admin users...")
  const admins = [
    {
      email: "alpha@mvppir.com",
      name: "Alpha Admin",
      password: "Alpha@2025!",
    },
    {
      email: "bravo@mvppir.com",
      name: "Bravo Admin",
      password: "Bravo@2025!",
    },
    {
      email: "charlie@mvppir.com",
      name: "Charlie Admin",
      password: "Charlie@2025!",
    },
    {
      email: "delta@mvppir.com",
      name: "Delta Admin",
      password: "Delta@2025!",
    },
  ]

  for (const admin of admins) {
    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: admin.email },
      select: { id: true, email: true },
    })

    if (existingUser) {
      console.log(`⏭️  Admin ${admin.email} already exists, skipping...`)
      continue
    }

    // Generate referral code (ALPHA, BRAVO, CHARLIE, DELTA)
    const referralCode = admin.name.split(" ")[0].toUpperCase()

    try {
      // Use Better Auth API to create user (handles password hashing automatically)
      const result = await auth.api.signUpEmail({
        body: {
          email: admin.email,
          password: admin.password,
          name: admin.name,
        },
      })

      if (!result || !result.user) {
        console.error(`❌ Failed to create admin ${admin.email}: No user returned`)
        continue
      }

      // Update user to be admin with referral code
      await prisma.user.update({
        where: { id: result.user.id },
        data: {
          role: "ADMIN",
          status: "ACTIVE",
          emailVerified: true,
          referralCode,
        },
      })

      console.log(`✅ Created admin: ${admin.email}`)
      console.log(`   Password: ${admin.password}`)
      console.log(`   Referral Code: ${referralCode}`)
    } catch (error) {
      console.error(`❌ Error creating admin ${admin.email}:`, error)
    }
  }

  console.log("\n🎉 Seed completed!")
  console.log("\n📋 Admin Credentials:")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  admins.forEach((admin) => {
    const code = admin.name.split(" ")[0].toUpperCase()
    console.log(`${admin.name}`)
    console.log(`  Email: ${admin.email}`)
    console.log(`  Password: ${admin.password}`)
    console.log(`  Referral Code: ${code}`)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  })
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
