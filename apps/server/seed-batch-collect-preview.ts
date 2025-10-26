import { prisma } from "./src/lib/prisma.js";
import { Wallet } from "ethers";
import { encryptPrivateKey } from "./src/lib/encryption.js";

/**
 * Script para popular transações CONFIRMED que aparecerão no Batch Collect Preview
 * Cria usuários com deposit addresses e transações confirmadas
 */
async function seedBatchCollectPreview() {
  try {
    console.log("📦 Criando transações CONFIRMED para Batch Collect Preview...");

    // Limpar dados de teste anteriores
    await prisma.walletTransaction.deleteMany({
      where: {
        user: {
          email: {
            startsWith: "test.batch",
          },
        },
      },
    });

    await prisma.depositAddress.deleteMany({
      where: {
        user: {
          email: {
            startsWith: "test.batch",
          },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: "test.batch",
        },
      },
    });

    console.log("✅ Dados de teste anteriores removidos");

    // Criar 3 usuários de teste
    const users = [];
    for (let i = 1; i <= 3; i++) {
      const user = await prisma.user.create({
        data: {
          name: `Test Batch User ${i}`,
          email: `test.batch${i}@example.com`,
          role: "user",
          status: "ACTIVE",
        },
      });
      users.push(user);
      console.log(`✅ Usuário criado: ${user.email}`);
    }

    // Criar deposit address para cada usuário
    const depositAddresses = [];
    for (const user of users) {
      const wallet = Wallet.createRandom();
      const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey);

      const depositAddress = await prisma.depositAddress.create({
        data: {
          userId: user.id,
          polygonAddress: wallet.address.toLowerCase(),
          privateKey: encryptedPrivateKey,
        },
      });
      depositAddresses.push(depositAddress);
      console.log(`✅ Deposit Address criado para ${user.email}: ${wallet.address}`);
    }

    // Criar transações CONFIRMED (simulando depósitos já confirmados)
    const tokens = [
      { symbol: "USDC", amount: "500.00", decimals: 6 },
      { symbol: "USDT", amount: "300.50", decimals: 6 },
      { symbol: "USDC", amount: "1200.00", decimals: 6 },
      { symbol: "MATIC", amount: "150.00", decimals: 18 },
    ];

    let txCount = 0;
    for (const [index, depositAddress] of depositAddresses.entries()) {
      for (const token of tokens) {
        const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
        const rawAmount = (
          Number(token.amount) * Math.pow(10, token.decimals)
        ).toString();

        await prisma.walletTransaction.create({
          data: {
            userId: users[index].id,
            depositAddressId: depositAddress.id,
            type: "CREDIT", // CREDIT = depósito
            tokenSymbol: token.symbol,
            tokenDecimals: token.decimals,
            amount: token.amount,
            rawAmount: rawAmount,
            status: "CONFIRMED", // Status CONFIRMED para aparecer no preview
            txHash: txHash,
          },
        });

        console.log(
          `✅ Transação CONFIRMED criada: ${token.symbol} ${token.amount} (${txHash.slice(0, 10)}...)`
        );
        txCount++;
      }
    }

    console.log(`\n✅ ${txCount} transações CONFIRMED criadas com sucesso!`);
    console.log("🎯 Acesse /admin/batch-collect para ver o preview");
  } catch (error) {
    console.error("❌ Erro ao criar mocks:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedBatchCollectPreview();
