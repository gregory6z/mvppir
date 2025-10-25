import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.user.update({
    where: { email: "referrer2@test.com" },
    data: {
      status: "ACTIVE",
      activatedAt: new Date(),
      lifetimeVolume: 100,
      blockedBalance: 100,
    },
  });

  console.log("✅ Referrer activated!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
