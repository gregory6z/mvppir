import { prisma } from "../src/lib/prisma";

async function clearCodes() {
  console.log("🧹 Clearing all referral codes...\n");

  await prisma.user.updateMany({
    data: { referralCode: null },
  });

  console.log("✅ All referral codes cleared!");
  await prisma.$disconnect();
}

clearCodes().catch(console.error);
