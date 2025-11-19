/**
 * Script para sincronizar User.blockedBalance de todos os usuários
 *
 * Este script deve ser executado UMA VEZ após o deploy das mudanças de blockedBalance
 * para garantir que todos os usuários tenham o blockedBalance correto.
 *
 * Uso: npx tsx scripts/sync-all-blocked-balances.ts
 */

import { prisma } from "../src/lib/prisma";
import { updateUserBlockedBalance } from "../src/modules/mlm/helpers/update-blocked-balance";

async function syncAllBlockedBalances() {
  console.log("🚀 Iniciando sincronização de blockedBalance para todos os usuários...\n");

  // Busca todos os usuários ativos
  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      id: true,
      email: true,
      name: true,
      blockedBalance: true,
    },
  });

  console.log(`📊 Encontrados ${users.length} usuários ativos\n`);

  let updated = 0;
  let unchanged = 0;
  let errors = 0;

  for (const user of users) {
    try {
      const oldBalance = user.blockedBalance;

      // Atualiza blockedBalance com base em depósitos - saques
      const newBalance = await updateUserBlockedBalance(user.id);

      if (!newBalance.equals(oldBalance)) {
        console.log(
          `✅ ${user.email}: ${oldBalance.toString()} → ${newBalance.toString()}`
        );
        updated++;
      } else {
        unchanged++;
      }
    } catch (error) {
      console.error(
        `❌ Erro ao atualizar ${user.email}:`,
        error instanceof Error ? error.message : "Unknown error"
      );
      errors++;
    }
  }

  console.log("\n📈 Resumo:");
  console.log(`  - Atualizados: ${updated}`);
  console.log(`  - Sem mudanças: ${unchanged}`);
  console.log(`  - Erros: ${errors}`);
  console.log(`  - Total processados: ${users.length}`);

  await prisma.$disconnect();
}

syncAllBlockedBalances()
  .then(() => {
    console.log("\n✅ Sincronização concluída!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  });
