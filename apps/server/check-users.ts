import { prisma } from "./src/lib/prisma.js";

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    console.log("\n📋 Users in database:");
    console.table(users);
    console.log(`\n✅ Total users: ${users.length}\n`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
