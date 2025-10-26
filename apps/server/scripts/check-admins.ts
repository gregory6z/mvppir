import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      email: true,
      name: true,
      role: true,
      status: true,
      accounts: {
        where: { providerId: "credential" },
        select: { id: true, password: true },
      },
    },
  })

  console.log("\n📋 Admins no banco:\n")
  admins.forEach((admin) => {
    console.log(`✅ ${admin.email}`)
    console.log(`   Nome: ${admin.name}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Status: ${admin.status}`)
    console.log(`   Tem senha: ${admin.accounts.length > 0 ? "SIM ✓" : "NÃO ✗"}`)
    if (admin.accounts.length > 0) {
      console.log(`   Password hash: ${admin.accounts[0].password?.substring(0, 20)}...`)
    }
    console.log("")
  })

  console.log(`Total: ${admins.length} admins\n`)

  // Show which passwords are correct
  console.log("Senhas corretas:")
  console.log("- alpha@mvppir.com / Alpha@2025!")
  console.log("- bravo@mvppir.com / Bravo@2025!")
  console.log("- charlie@mvppir.com / Charlie@2025!")
  console.log("- delta@mvppir.com / Delta@2025!")

  process.exit(0)
}

main()
