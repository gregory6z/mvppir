import { prisma } from "./src/lib/prisma.js";

/**
 * Script para remover dados mockados da Global Wallet
 * Isso deixará apenas os dados reais da blockchain
 */
async function clearGlobalWalletMocks() {
  try {
    console.log("🗑️  Removendo dados mockados da Global Wallet...");

    // Deletar todos os balances mockados
    const result = await prisma.globalWalletBalance.deleteMany({});

    console.log(`✅ ${result.count} registros mockados foram removidos`);
    console.log("✅ Global Wallet agora mostrará apenas dados reais da blockchain");
  } catch (error) {
    console.error("❌ Erro ao limpar dados mockados:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearGlobalWalletMocks();
