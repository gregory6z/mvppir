#!/usr/bin/env tsx
/**
 * Script de migração: WalletTransaction → Balance
 *
 * Popula a tabela Balance com saldos calculados das transações existentes.
 * Deve ser executado UMA VEZ após criar as tabelas Balance.
 *
 * Uso:
 *   npx tsx scripts/migrate-to-balance.ts
 */

import { prisma } from "../src/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

async function migrateToBalance() {
  console.log("🔄 Migrando saldos para tabela Balance...\n");

  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });

  console.log(`📊 ${users.length} usuários encontrados\n`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    console.log(`\n👤 Processando ${user.email} (${user.id})`);

    // Busca transações CONFIRMADAS e SENT_TO_GLOBAL
    const transactions = await prisma.walletTransaction.findMany({
      where: {
        userId: user.id,
        status: { in: ["CONFIRMED", "SENT_TO_GLOBAL"] },
      },
      select: {
        type: true,
        tokenSymbol: true,
        tokenAddress: true,
        amount: true,
      },
    });

    if (transactions.length === 0) {
      console.log(`   ⏭️  Sem transações confirmadas, pulando...`);
      skippedCount++;
      continue;
    }

    // Agrupa por token
    const balancesByToken = new Map<
      string,
      { tokenAddress: string | null; balance: Decimal }
    >();

    for (const tx of transactions) {
      const key = tx.tokenSymbol;
      const current = balancesByToken.get(key) || {
        tokenAddress: tx.tokenAddress,
        balance: new Decimal(0),
      };

      if (tx.type === "CREDIT") {
        current.balance = current.balance.add(tx.amount);
      } else {
        current.balance = current.balance.sub(tx.amount);
      }

      balancesByToken.set(key, current);
    }

    console.log(`   💰 Saldos calculados:`);

    // Cria registros Balance
    for (const [tokenSymbol, { tokenAddress, balance }] of balancesByToken) {
      // Pula se saldo for 0
      if (balance.eq(0)) {
        console.log(`   ⏭️  ${tokenSymbol}: 0 (pulando)`);
        continue;
      }

      try {
        await prisma.balance.create({
          data: {
            userId: user.id,
            tokenSymbol,
            tokenAddress,
            availableBalance: balance,
            lockedBalance: new Decimal(0), // Nenhum saque pendente inicialmente
          },
        });

        console.log(`   ✅ ${tokenSymbol}: ${balance.toString()}`);
        migratedCount++;
      } catch (error: any) {
        if (error.code === "P2002") {
          // Unique constraint violation - já existe
          console.log(`   ⚠️  ${tokenSymbol}: já existe, pulando...`);
        } else {
          throw error;
        }
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✨ Migração concluída!`);
  console.log(`   ✅ ${migratedCount} saldos criados`);
  console.log(`   ⏭️  ${skippedCount} usuários sem saldo`);
  console.log("=".repeat(60) + "\n");

  console.log("⚠️  IMPORTANTE:");
  console.log("1. Verifique os saldos com: SELECT * FROM balances;");
  console.log("2. Compare com transações para validar");
  console.log("3. Após validar, atualize o código para usar Balance");
}

migrateToBalance()
  .catch((e) => {
    console.error("\n❌ Erro na migração:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
