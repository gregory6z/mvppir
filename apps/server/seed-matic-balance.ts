import { prisma } from "./src/lib/prisma.js";

/**
 * Script para adicionar saldo de MATIC na Global Wallet
 * Isso fará com que o Batch Collect Preview mostre canExecute: true
 */
async function seedMaticBalance() {
  try {
    console.log("⛽ Adicionando saldo de MATIC na Global Wallet...");

    // Buscar Global Wallet
    const globalWallet = await prisma.globalWallet.findFirst();

    if (!globalWallet) {
      console.error("❌ Global Wallet não encontrada. Execute create-global-wallet.ts primeiro.");
      process.exit(1);
    }

    // Verificar se já existe saldo de MATIC
    const existingBalance = await prisma.globalWalletBalance.findFirst({
      where: {
        globalWalletId: globalWallet.id,
        tokenSymbol: "MATIC",
      },
    });

    if (existingBalance) {
      // Atualizar saldo existente
      await prisma.globalWalletBalance.update({
        where: { id: existingBalance.id },
        data: {
          balance: "500.00", // 500 MATIC para gas fees
        },
      });
      console.log("✅ Saldo de MATIC atualizado: 500.00 MATIC");
    } else {
      // Criar novo saldo
      await prisma.globalWalletBalance.create({
        data: {
          globalWalletId: globalWallet.id,
          tokenSymbol: "MATIC",
          tokenAddress: null, // MATIC é native token
          balance: "500.00", // 500 MATIC para gas fees
        },
      });
      console.log("✅ Saldo de MATIC criado: 500.00 MATIC");
    }

    console.log("\n🎯 Acesse /admin/batch-collect para ver o preview com MATIC suficiente");
  } catch (error) {
    console.error("❌ Erro ao adicionar MATIC:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedMaticBalance();
