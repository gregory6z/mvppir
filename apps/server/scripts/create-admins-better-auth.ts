import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

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

async function main() {
  console.log("🌱 Creating admin users via Better Auth pattern...\n")

  for (const admin of admins) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: admin.email },
      })

      if (existingUser) {
        console.log(`⏭️  Admin ${admin.email} already exists, skipping...`)
        continue
      }

      // Hash password (Better Auth uses bcrypt with 10 rounds)
      const hashedPassword = await bcrypt.hash(admin.password, 10)

      // Create user and account in a transaction (Better Auth pattern)
      await prisma.$transaction(async (tx) => {
        // 1. Create user
        const user = await tx.user.create({
          data: {
            email: admin.email,
            name: admin.name,
            emailVerified: true,
            role: "ADMIN",
            status: "ACTIVE",
          },
        })

        // 2. Create account (Better Auth credentials table)
        await tx.account.create({
          data: {
            id: crypto.randomUUID(),
            userId: user.id,
            accountId: user.id,
            providerId: "credential",
            password: hashedPassword,
          },
        })

        console.log(`✅ Created admin: ${admin.email}`)
        console.log(`   Name: ${admin.name}`)
        console.log(`   Password: ${admin.password}\n`)
      })
    } catch (error) {
      console.error(`❌ Failed to create ${admin.email}:`, error)
    }
  }

  console.log("\n🎉 Admin creation completed!\n")
  console.log("📋 Admin Credentials:")
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
    console.error("❌ Script failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
