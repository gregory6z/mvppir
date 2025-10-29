import { prisma } from "../src/lib/prisma";

async function checkReferralCodes() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      referralCode: true,
      status: true,
      currentRank: true,
      totalDirects: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  console.log("📋 Users with referral codes:\n");

  if (users.length === 0) {
    console.log("❌ No users found in database");
    console.log("\n💡 You need to create at least one user first!");
    console.log("   The first user will automatically get a referral code.");
  } else {
    users.forEach((user) => {
      console.log("---");
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Referral Code: ${user.referralCode || "NOT SET"}`);
      console.log(`Status: ${user.status}`);
      console.log(`Rank: ${user.currentRank}`);
      console.log(`Total Directs: ${user.totalDirects}`);
    });
  }

  await prisma.$disconnect();
}

checkReferralCodes().catch(console.error);
