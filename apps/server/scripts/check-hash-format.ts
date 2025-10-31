import { prisma } from "../src/lib/prisma"

async function checkHashFormat() {
  const user = await prisma.user.findUnique({
    where: { email: "test123@test.com" },
    select: { id: true }
  })

  if (user) {
    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential"
      },
      select: { password: true }
    })

    console.log("Password hash format:")
    console.log("Length:", account?.password?.length)
    console.log("Full hash:", account?.password)

    if (account?.password) {
      const parts = account.password.split(":")
      console.log("Hash structure:")
      console.log(`  - Parts: ${parts.length}`)
      parts.forEach((part, i) => {
        console.log(`  - Part ${i}: ${part.length} chars - ${part.substring(0, 20)}...`)
      })
    }
  }

  await prisma.$disconnect()
}

checkHashFormat()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error)
    process.exit(1)
  })
