/**
 * Fix gregory10@gmail.com rank back to RECRUIT
 * User has $500 blocked but 0 directs, so should be RECRUIT not BRONZE
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Fixing gregory10@gmail.com rank...\n");

  const user = await prisma.user.update({
    where: { email: "gregory10@gmail.com" },
    data: {
      currentRank: "RECRUIT",
      rankStatus: "ACTIVE",
    },
    select: {
      id: true,
      email: true,
      name: true,
      currentRank: true,
      totalDirects: true,
      blockedBalance: true,
    },
  });

  console.log("✅ Rank corrigido:", user);
  console.log("\nℹ️  Usuário manterá $500 bloqueados mas com rank RECRUIT");
  console.log("📋 Para alcançar BRONZE, precisa recrutar 3 pessoas diretas");
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  });
