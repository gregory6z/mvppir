import { prisma } from "../src/lib/prisma";
import { env } from "../src/config/env";
import { Wallet } from "ethers";

/**
 * Testa withdrawal REAL na blockchain Amoy sem precisar de ngrok/webhook
 *
 * Uso:
 * NODE_ENV=test npx tsx scripts/test-withdrawal-real.ts
 *
 * O que faz:
 * 1. Cria usuário de teste
 * 2. Adiciona 0.05 MATIC no balance (simula depósito)
 * 3. Cria withdrawal para endereço externo
 * 4. Admin aprova
 * 5. Processa withdrawal REAL na blockchain!
 */

async function testWithdrawalReal() {
  console.log("🧪 Testando withdrawal REAL na Amoy Testnet...\n");

  // Valida que estamos em modo correto
  if (env.SKIP_BLOCKCHAIN_PROCESSING) {
    console.error("❌ SKIP_BLOCKCHAIN_PROCESSING está true!");
    console.log("Configure no .env.test:");
    console.log("SKIP_BLOCKCHAIN_PROCESSING=false");
    process.exit(1);
  }

  console.log("✅ Modo: Blockchain REAL (Amoy)");
  console.log(`   RPC: ${env.POLYGON_RPC_URL}`);
  console.log(`   Chain ID: ${env.POLYGON_CHAIN_ID}`);
  console.log("");

  // 1. Verifica Global Wallet
  const globalWallet = await prisma.globalWallet.findFirst();
  if (!globalWallet) {
    console.error("❌ Global Wallet não encontrada!");
    console.log("Execute: NODE_ENV=test npx tsx scripts/create-global-wallet.ts");
    process.exit(1);
  }

  console.log("✅ Global Wallet encontrada:");
  console.log(`   Address: ${globalWallet.polygonAddress}`);
  console.log("");

  // 2. Cria usuário de teste
  console.log("📝 Criando usuário de teste...");
  const email = `test-withdrawal-${Date.now()}@example.com`;

  const user = await prisma.user.create({
    data: {
      email,
      name: "Test Withdrawal User",
      status: "ACTIVE",
      role: "user",
    },
  });

  console.log(`✅ Usuário criado: ${user.email}`);
  console.log("");

  // 3. Cria balance (simula depósito de 0.05 MATIC)
  console.log("💰 Adicionando 0.05 MATIC no balance (simula depósito)...");

  await prisma.balance.create({
    data: {
      userId: user.id,
      tokenSymbol: "MATIC",
      availableBalance: 0.05,
      lockedBalance: 0,
    },
  });

  console.log("✅ Balance criado: 0.05 MATIC disponível");
  console.log("");

  // 4. Gera endereço de destino aleatório (para onde vamos enviar)
  const destinationWallet = Wallet.createRandom();
  console.log("🎯 Endereço de destino (receberá o MATIC):");
  console.log(`   ${destinationWallet.address}`);
  console.log("");

  // 5. Cria withdrawal request
  console.log("📤 Criando withdrawal request...");

  const withdrawal = await prisma.withdrawal.create({
    data: {
      userId: user.id,
      tokenSymbol: "MATIC",
      amount: 0.03, // Envia 0.03 MATIC (economiza 0.02 para testes futuros)
      fee: 0,
      destinationAddress: destinationWallet.address.toLowerCase(),
      status: "PENDING_APPROVAL",
    },
  });

  console.log(`✅ Withdrawal criado: ${withdrawal.id}`);
  console.log(`   Quantidade: ${withdrawal.amount} MATIC`);
  console.log("");

  // 6. Atualiza balance (lock do saldo)
  console.log("🔒 Bloqueando saldo...");

  await prisma.balance.update({
    where: {
      userId_tokenSymbol: {
        userId: user.id,
        tokenSymbol: "MATIC",
      },
    },
    data: {
      availableBalance: { decrement: 0.03 },
      lockedBalance: { increment: 0.03 },
    },
  });

  console.log("✅ Saldo bloqueado (0.03 MATIC em locked)");
  console.log("");

  // 7. Cria admin para aprovar
  console.log("👤 Criando admin...");

  const admin = await prisma.user.create({
    data: {
      email: `admin-${Date.now()}@example.com`,
      name: "Test Admin",
      status: "ACTIVE",
      role: "admin",
    },
  });

  console.log(`✅ Admin criado: ${admin.email}`);
  console.log("");

  // 8. Aprova withdrawal (vai processar automaticamente!)
  console.log("✅ Aprovando withdrawal...");
  console.log("⚠️  ATENÇÃO: Isso vai fazer uma transação REAL na blockchain!");
  console.log("");

  const { approveWithdrawal } = await import(
    "../src/modules/withdrawal/use-cases/approve-withdrawal"
  );

  try {
    await approveWithdrawal({
      withdrawalId: withdrawal.id,
      adminId: admin.id,
    });

    console.log("✅ Withdrawal aprovado!");
    console.log("");

    // Aguarda alguns segundos para processar
    console.log("⏳ Aguardando processamento (30s)...");
    await new Promise((resolve) => setTimeout(resolve, 30000));

    // 9. Verifica status final
    const finalWithdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawal.id },
    });

    console.log("");
    console.log("📊 STATUS FINAL:");
    console.log(`   Status: ${finalWithdrawal?.status}`);
    console.log(`   TX Hash: ${finalWithdrawal?.txHash || "N/A"}`);

    if (finalWithdrawal?.txHash) {
      console.log("");
      console.log("🔗 Ver transação no explorer:");
      console.log(
        `   https://amoy.polygonscan.com/tx/${finalWithdrawal.txHash}`
      );
      console.log("");
      console.log("🎯 Ver endereço de destino:");
      console.log(
        `   https://amoy.polygonscan.com/address/${destinationWallet.address}`
      );
    }

    console.log("");
    console.log("🎉 Teste completo!");
    console.log("");
    console.log("💰 Saldo restante da Global Wallet:");
    console.log("   Execute: NODE_ENV=test npx tsx scripts/check-global-wallet-balance.ts");
  } catch (error: any) {
    console.error("");
    console.error("❌ Erro ao processar withdrawal:", error.message);
    console.log("");
    console.log("Isso pode acontecer se:");
    console.log("- Global Wallet sem MATIC suficiente");
    console.log("- Problema de RPC");
    console.log("- Token address não configurado");
  }

  await prisma.$disconnect();
}

testWithdrawalReal().catch((error) => {
  console.error("❌ Erro:", error);
  process.exit(1);
});
