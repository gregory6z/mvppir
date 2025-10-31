/**
 * Script to block initial balance for gregory10@gmail.com
 *
 * This will trigger the auto-block mechanism for existing balances
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔒 Bloqueando saldo inicial para gregory10@gmail.com...\n");

  // 1. Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email: "gregory10@gmail.com" },
    select: {
      id: true,
      name: true,
      email: true,
      currentRank: true,
      blockedBalance: true,
    },
  });

  if (!user) {
    console.log("❌ Usuário não encontrado");
    return;
  }

  console.log("👤 Usuário:", {
    name: user.name,
    email: user.email,
    currentRank: user.currentRank,
    blockedBalance: user.blockedBalance.toString(),
  });

  // 2. Buscar saldo USDC
  const balance = await prisma.balance.findUnique({
    where: {
      userId_tokenSymbol: {
        userId: user.id,
        tokenSymbol: "USDC",
      },
    },
    select: {
      availableBalance: true,
      lockedBalance: true,
    },
  });

  if (!balance) {
    console.log("❌ Saldo USDC não encontrado");
    return;
  }

  console.log("\n💰 Saldo USDC atual:", {
    available: balance.availableBalance.toString(),
    locked: balance.lockedBalance.toString(),
    blocked: user.blockedBalance.toString(),
  });

  // 3. Importar e executar auto-block
  const { autoBlockBalance } = await import("../src/modules/mlm/use-cases/auto-block-balance");

  console.log("\n🔄 Executando auto-bloqueio...\n");

  const result = await autoBlockBalance({ userId: user.id });

  console.log("✅ Resultado:", {
    blocked: result.blocked,
    amountBlocked: result.amountBlocked,
    previousRank: result.previousRank,
    newRank: result.newRank,
    blockedBalance: result.blockedBalance,
    availableBalance: result.availableBalance,
  });

  if (result.blocked) {
    console.log(`\n🎖️  Rank atualizado: ${result.previousRank} → ${result.newRank}`);
    console.log(`💵 Bloqueado: $${result.amountBlocked}`);
    console.log(`🔒 Total bloqueado: $${result.blockedBalance}`);
    console.log(`💰 Disponível: $${result.availableBalance}`);
  } else {
    console.log("\nℹ️  Nenhum bloqueio necessário");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\n✅ Script concluído!");
  })
  .catch(async (error) => {
    console.error("\n❌ Erro:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
