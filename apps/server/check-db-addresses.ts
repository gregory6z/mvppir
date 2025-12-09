import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
config();

const prisma = new PrismaClient();

async function main() {
  const targetAddress = "0xbe9b58870c378652f425716d53cb3f4413899a44";

  // 1. Verifica se o endereço existe no DB
  const depositAddress = await prisma.depositAddress.findUnique({
    where: { polygonAddress: targetAddress.toLowerCase() },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  console.log("📍 Endereço no banco de dados:");
  if (depositAddress) {
    console.log("  ✅ Encontrado!");
    console.log("  User ID:", depositAddress.userId);
    console.log("  User Email:", depositAddress.user.email);
    console.log("  User Name:", depositAddress.user.name);
    console.log("  Status:", depositAddress.status);
    console.log("  Created:", depositAddress.createdAt);
  } else {
    console.log("  ❌ NÃO encontrado no banco!");
  }

  // 2. Lista TODOS os deposit addresses
  const allAddresses = await prisma.depositAddress.findMany({
    include: { user: { select: { email: true } } },
  });

  console.log("\n📋 Todos os endereços de depósito no sistema:");
  console.log("  Total:", allAddresses.length);
  for (const addr of allAddresses) {
    console.log("  -", addr.polygonAddress, "|", addr.user.email);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
