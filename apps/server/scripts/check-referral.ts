import { prisma } from "../src/lib/prisma";

async function main() {
  const referrer = await prisma.user.findUnique({
    where: { email: "referrer2@test.com" },
    select: {
      id: true,
      name: true,
      email: true,
      referralCode: true,
      status: true,
      _count: {
        select: { referrals: true },
      },
    },
  });

  console.log("\nReferrer:");
  console.log(referrer);

  const referred = await prisma.user.findUnique({
    where: { email: "referred-final@test.com" },
    select: {
      id: true,
      name: true,
      email: true,
      referrerId: true,
      referrer: {
        select: {
          email: true,
          referralCode: true,
        },
      },
    },
  });

  console.log("\nReferred User:");
  console.log(referred);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
