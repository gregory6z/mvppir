import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

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
    })

    if (existingUser) {
      console.log(`⏭️  Admin ${admin.email} already exists, skipping...`)
      continue
    }

    // Hash password with bcrypt (same as Better Auth)
    const hashedPassword = await bcrypt.hash(admin.password, 10)

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email: admin.email,
        name: admin.name,
        emailVerified: true,
        role: "ADMIN",
        status: "ACTIVE",
      },
    })

    // Create account with hashed password (Better Auth table)
    await prisma.account.create({
      data: {
        id: `${user.id}_credential`, // Better Auth format
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: hashedPassword,
      },
    })

    console.log(`✅ Created admin: ${admin.email}`)
    console.log(`   Password: ${admin.password}`)
  }

  console.log("\n🎉 Seed completed!")
  console.log("\n📋 Admin Credentials:")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  admins.forEach((admin) => {
    console.log(`${admin.name}`)
    console.log(`  Email: ${admin.email}`)
    console.log(`  Password: ${admin.password}`)
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
