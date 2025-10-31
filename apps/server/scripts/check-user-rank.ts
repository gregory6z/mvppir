import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "gregory10@gmail.com" },
    select: {
      id: true,
      email: true,
      name: true,
      currentRank: true,
      totalDirects: true,
      blockedBalance: true,
      rankStatus: true,
    },
  });

  console.log("User data:", user);
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
  });
