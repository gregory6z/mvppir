import { prisma } from "./src/lib/prisma.js";

/**
 * Script para remover o saldo de MATIC da Global Wallet
 */
async function removeMaticBalance() {
  try {
    console.log("🗑️  Removendo saldo de MATIC da Global Wallet...\n");

    // Buscar a Global Wallet
    const globalWallet = await prisma.globalWallet.findFirst();

    if (!globalWallet) {
      console.log("⚠️  Global Wallet não encontrada");
      return;
    }

    // Remover saldo de MATIC
    const deleted = await prisma.globalWalletBalance.deleteMany({
      where: {
        globalWalletId: globalWallet.id,
        tokenSymbol: "MATIC",
      },
    });

    if (deleted.count > 0) {
      console.log(`✅ ${deleted.count} registro(s) de MATIC removido(s) com sucesso!`);
    } else {
      console.log("⚠️  Nenhum registro de MATIC encontrado");
    }
  } catch (error) {
    console.error("❌ Erro ao remover saldo de MATIC:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

removeMaticBalance();
