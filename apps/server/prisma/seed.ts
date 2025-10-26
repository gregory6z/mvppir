import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // Admin users with military code names
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
