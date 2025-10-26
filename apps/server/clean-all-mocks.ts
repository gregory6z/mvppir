import { prisma } from "./src/lib/prisma.js";

/**
 * Script para remover TODOS os dados de mock/teste do banco de dados
 *
 * Remove:
 * - Usuários de teste (test.batch*, user.withdrawal*)
 * - Admin de teste (admin@mvppir.com)
 * - Histórico de batch collects
 * - Withdrawals de teste
 * - Saldo de MATIC da Global Wallet (opcional)
 * - Transações de teste
 * - Deposit addresses de teste
 */
async function cleanAllMocks() {
  try {
    console.log("🧹 Iniciando limpeza de todos os mocks...\n");

    // 1. Buscar admin de teste
    const adminUser = await prisma.user.findFirst({
      where: {
        email: "admin@mvppir.com",
      },
    });

    if (adminUser) {
      console.log(`📋 Admin de teste encontrado: ${adminUser.email}`);

      // 1.1. Remover histórico de batch collects do admin
      const deletedBatchCollects = await prisma.batchCollect.deleteMany({
        where: {
          executedBy: adminUser.id,
        },
      });
      console.log(`   ✅ ${deletedBatchCollects.count} registros de batch collect removidos`);

      // 1.2. Remover withdrawals aprovados/rejeitados pelo admin
      const deletedWithdrawals = await prisma.withdrawal.deleteMany({
        where: {
          approvedBy: adminUser.id,
        },
      });
      console.log(`   ✅ ${deletedWithdrawals.count} withdrawals (aprovados/rejeitados) removidos`);
    }

    // 2. Remover usuários de teste (test.batch* e user.withdrawal*)
    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { startsWith: "test.batch" } },
          { email: { startsWith: "user.withdrawal" } },
        ],
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (testUsers.length > 0) {
      console.log(`\n📋 ${testUsers.length} usuários de teste encontrados`);

      for (const user of testUsers) {
        // 2.1. Remover withdrawals
        const deletedWithdrawals = await prisma.withdrawal.deleteMany({
          where: { userId: user.id },
        });
        console.log(`   ✅ ${user.email}: ${deletedWithdrawals.count} withdrawals removidos`);

        // 2.2. Remover transações
        const deletedTxs = await prisma.walletTransaction.deleteMany({
          where: { userId: user.id },
        });
        console.log(`   ✅ ${user.email}: ${deletedTxs.count} transações removidas`);

        // 2.3. Remover balances
        const deletedBalances = await prisma.balance.deleteMany({
          where: { userId: user.id },
        });
        console.log(`   ✅ ${user.email}: ${deletedBalances.count} balances removidos`);

        // 2.4. Remover deposit addresses
        const deletedAddresses = await prisma.depositAddress.deleteMany({
          where: { userId: user.id },
        });
        console.log(`   ✅ ${user.email}: ${deletedAddresses.count} endereços removidos`);

        // 2.5. Remover usuário
        await prisma.user.delete({
          where: { id: user.id },
        });
        console.log(`   ✅ ${user.email}: usuário removido`);
      }
    }

    // 3. Remover admin de teste (se desejar)
    if (adminUser) {
      console.log(`\n📋 Removendo admin de teste...`);

      // Verificar se o admin tem outras relações importantes
      const adminSessions = await prisma.session.count({
        where: { userId: adminUser.id },
      });

      if (adminSessions > 0) {
        console.log(`   ⚠️  Admin tem ${adminSessions} sessões ativas. Removendo...`);
        await prisma.session.deleteMany({
          where: { userId: adminUser.id },
        });
      }

      await prisma.user.delete({
        where: { id: adminUser.id },
      });
      console.log(`   ✅ Admin removido: ${adminUser.email}`);
    }

    // 4. Limpar saldo de MATIC da Global Wallet (opcional - comentado por padrão)
    // Descomente se quiser remover o saldo de MATIC também
    /*
    const globalWallet = await prisma.globalWallet.findFirst();
    if (globalWallet) {
      const deletedMaticBalance = await prisma.globalWalletBalance.deleteMany({
        where: {
          globalWalletId: globalWallet.id,
          tokenSymbol: "MATIC",
        },
      });
      console.log(`\n✅ ${deletedMaticBalance.count} saldo de MATIC da Global Wallet removido`);
    }
    */

    console.log("\n✅ Limpeza concluída com sucesso!");
    console.log("🎯 Todos os dados de mock foram removidos do banco de dados");
  } catch (error) {
    console.error("❌ Erro ao limpar mocks:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAllMocks();
