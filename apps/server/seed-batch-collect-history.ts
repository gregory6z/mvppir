import { prisma } from "./src/lib/prisma.js";

/**
 * Script para popular histórico de Batch Collects
 * Cria registros de coletas já realizadas para aparecer na tabela de histórico
 */
async function seedBatchCollectHistory() {
  try {
    console.log("📜 Criando histórico de Batch Collects...");

    // Buscar global wallet
    const globalWallet = await prisma.globalWallet.findFirst();

    if (!globalWallet) {
      console.error("❌ Global Wallet não encontrada. Execute create-global-wallet.ts primeiro.");
      process.exit(1);
    }

    // Buscar ou criar admin de teste
    let adminUser = await prisma.user.findFirst({
      where: {
        role: "admin",
        email: "admin@mvppir.com",
      },
    });

    if (!adminUser) {
      console.log("👤 Criando admin de teste...");
      adminUser = await prisma.user.create({
        data: {
          email: "admin@mvppir.com",
          name: "Admin Sistema",
          role: "admin",
          status: "ACTIVE",
        },
      });
      console.log("✅ Admin criado: admin@mvppir.com");
    } else {
      console.log(`✅ Admin encontrado: ${adminUser.email}`);
    }

    // Limpar histórico anterior de teste
    await prisma.batchCollect.deleteMany({
      where: {
        executedBy: adminUser.id,
      },
    });
    console.log("🧹 Histórico de teste anterior removido");

    // Criar histórico de coletas (simulando coletas passadas)
    const historyData = [
      {
        tokenSymbol: "USDC",
        totalCollected: "1500.00",
        walletsCount: 5,
        status: "COMPLETED" as const,
        executedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
      },
      {
        tokenSymbol: "USDT",
        totalCollected: "800.50",
        walletsCount: 3,
        status: "COMPLETED" as const,
        executedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
      },
      {
        tokenSymbol: "MATIC",
        totalCollected: "300.00",
        walletsCount: 4,
        status: "PARTIAL" as const,
        executedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
      },
      {
        tokenSymbol: "USDC",
        totalCollected: "2100.00",
        walletsCount: 7,
        status: "COMPLETED" as const,
        executedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
      },
      {
        tokenSymbol: "WETH",
        totalCollected: "5.50",
        walletsCount: 2,
        status: "FAILED" as const,
        executedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      },
      {
        tokenSymbol: "USDC",
        totalCollected: "3200.00",
        walletsCount: 8,
        status: "COMPLETED" as const,
        executedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
      },
      {
        tokenSymbol: "DAI",
        totalCollected: "950.00",
        walletsCount: 4,
        status: "COMPLETED" as const,
        executedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
      },
    ];

    for (const item of historyData) {
      // Gerar txHashes de exemplo
      const txHashes = [];
      for (let i = 0; i < item.walletsCount; i++) {
        const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
        txHashes.push(txHash);
      }

      await prisma.batchCollect.create({
        data: {
          globalWalletId: globalWallet.id,
          tokenSymbol: item.tokenSymbol,
          totalCollected: item.totalCollected,
          walletsCount: item.walletsCount,
          status: item.status,
          txHashes: txHashes,
          executedBy: adminUser.id,
          executedAt: item.executedAt,
          createdAt: item.executedAt,
        },
      });

      console.log(
        `✅ Histórico criado: ${item.tokenSymbol} - ${item.totalCollected} (${item.status}) - Executado por ${adminUser.name}`
      );
    }

    console.log(`\n✅ ${historyData.length} registros de histórico criados!`);
    console.log("🎯 Acesse /admin/batch-collect para ver o histórico");
  } catch (error) {
    console.error("❌ Erro ao criar histórico:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedBatchCollectHistory();
