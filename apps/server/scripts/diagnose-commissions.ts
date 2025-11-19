/**
 * Script de diagnóstico para investigar por que comissões não foram geradas
 *
 * Uso: npx tsx scripts/diagnose-commissions.ts
 */

import { prisma } from "../src/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

async function diagnoseCommissions() {
  console.log("🔍 Diagnóstico do sistema de comissões\n");

  // 1. Verificar usuários elegíveis
  console.log("📊 1. USUÁRIOS ELEGÍVEIS");
  console.log("=" .repeat(60));

  const allActiveUsers = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      id: true,
      email: true,
      status: true,
      rankStatus: true,
      currentRank: true,
      blockedBalance: true,
    },
  });

  console.log(`Total usuários ACTIVE: ${allActiveUsers.length}\n`);

  const eligibleUsers = allActiveUsers.filter(
    (u) => u.rankStatus !== "DOWNRANKED"
  );
  console.log(`Usuários elegíveis (não DOWNRANKED): ${eligibleUsers.length}\n`);

  const downrankedUsers = allActiveUsers.filter(
    (u) => u.rankStatus === "DOWNRANKED"
  );
  if (downrankedUsers.length > 0) {
    console.log(`⚠️  Usuários DOWNRANKED (não recebem comissões):`);
    downrankedUsers.forEach((u) => {
      console.log(
        `   - ${u.email} (blockedBalance: ${u.blockedBalance.toString()})`
      );
    });
    console.log();
  }

  // 2. Verificar blockedBalance
  console.log("💰 2. BLOCKED BALANCE");
  console.log("=".repeat(60));

  const usersWithBalance = eligibleUsers.filter((u) =>
    u.blockedBalance.gt(0)
  );
  const usersWithoutBalance = eligibleUsers.filter((u) =>
    u.blockedBalance.lte(0)
  );

  console.log(`Usuários com blockedBalance > 0: ${usersWithBalance.length}`);
  console.log(`Usuários com blockedBalance <= 0: ${usersWithoutBalance.length}\n`);

  if (usersWithBalance.length > 0) {
    console.log("✅ Usuários que DEVERIAM receber comissões N0:");
    usersWithBalance.forEach((u) => {
      console.log(
        `   ${u.email} - Rank: ${u.currentRank} - blockedBalance: ${u.blockedBalance.toString()}`
      );
    });
    console.log();
  }

  if (usersWithoutBalance.length > 0) {
    console.log("⚠️  Usuários SEM blockedBalance:");
    usersWithoutBalance.forEach((u) => {
      console.log(`   ${u.email} - blockedBalance: ${u.blockedBalance.toString()}`);
    });
    console.log();
  }

  // 3. Verificar comissões criadas hoje
  console.log("📅 3. COMISSÕES CRIADAS HOJE");
  console.log("=".repeat(60));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayCommissions = await prisma.commission.findMany({
    where: {
      createdAt: {
        gte: today,
      },
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  console.log(`Comissões criadas hoje: ${todayCommissions.length}\n`);

  if (todayCommissions.length > 0) {
    const groupedByUser = todayCommissions.reduce((acc, c) => {
      const email = c.user.email;
      if (!acc[email]) {
        acc[email] = { count: 0, total: new Decimal(0) };
      }
      acc[email].count++;
      acc[email].total = acc[email].total.add(c.finalAmount);
      return acc;
    }, {} as Record<string, { count: number; total: Decimal }>);

    console.log("✅ Comissões por usuário:");
    Object.entries(groupedByUser).forEach(([email, data]) => {
      console.log(`   ${email}: ${data.count} comissões, total: ${data.total.toString()} USDC`);
    });
    console.log();
  } else {
    console.log("❌ NENHUMA comissão foi criada hoje!\n");
  }

  // 4. Verificar última execução do worker
  console.log("⏰ 4. ÚLTIMA COMISSÃO REGISTRADA");
  console.log("=".repeat(60));

  const lastCommission = await prisma.commission.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (lastCommission) {
    console.log(`Última comissão:`);
    console.log(`   Usuário: ${lastCommission.user.email}`);
    console.log(`   Valor: ${lastCommission.finalAmount.toString()} USDC`);
    console.log(`   Criada em: ${lastCommission.createdAt.toISOString()}`);
    console.log(`   Referência: ${lastCommission.referenceDate.toISOString()}`);
    console.log();
  } else {
    console.log("❌ Nenhuma comissão encontrada no sistema!\n");
  }

  // 5. Verificar Balance vs blockedBalance
  console.log("🔄 5. SINCRONIZAÇÃO BLOCKED BALANCE");
  console.log("=".repeat(60));

  for (const user of usersWithBalance.slice(0, 3)) {
    // Pega apenas os 3 primeiros para não logar muito
    const balances = await prisma.balance.findMany({
      where: {
        userId: user.id,
        tokenSymbol: { in: ["USDC", "USDT"] },
      },
    });

    const totalAvailable = balances.reduce(
      (sum, b) => sum.add(b.availableBalance),
      new Decimal(0)
    );

    console.log(`\n${user.email}:`);
    console.log(`   User.blockedBalance: ${user.blockedBalance.toString()}`);
    console.log(`   Balance.availableBalance (USDC+USDT): ${totalAvailable.toString()}`);

    if (!user.blockedBalance.equals(totalAvailable)) {
      console.log(`   ⚠️  DESINCRONIZADO!`);
    } else {
      console.log(`   ✅ Sincronizado`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Diagnóstico concluído\n");

  await prisma.$disconnect();
}

diagnoseCommissions()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro:", error);
    process.exit(1);
  });
