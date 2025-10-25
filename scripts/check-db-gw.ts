import { prisma } from "../src/lib/prisma";

async function check() {
  const gw = await prisma.globalWallet.findMany();
  console.log("Global Wallets encontradas:", gw.length);
  gw.forEach((w) => console.log("  Address:", w.polygonAddress));
  await prisma.$disconnect();
}

check();
