import { prisma } from "@/lib/prisma";
import { calculateTotalUSD } from "@/services/price.service";
import { Decimal } from "@prisma/client/runtime/library";

const ACTIVATION_THRESHOLD_USD = 100; // $100 USD

interface CheckAccountActivationRequest {
  userId: string;
}

interface CheckAccountActivationResponse {
  activated: boolean;
  currentTotalUSD: number;
  requiredUSD: number;
  missingUSD: number;
}

/**
 * Verifica se o usuário atingiu o depósito mínimo de $100 USD
 * e ativa a conta automaticamente se necessário
 */
export async function checkAccountActivation({
  userId,
}: CheckAccountActivationRequest): Promise<CheckAccountActivationResponse> {
  // Busca usuário
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      status: true,
      activatedAt: true,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  // Se já está ativo, retorna
  if (user.status === "ACTIVE") {
    console.log(`ℹ️  Conta ${userId} já está ativa desde ${user.activatedAt}`);
    return {
      activated: true,
      currentTotalUSD: 0, // Não precisa calcular
      requiredUSD: ACTIVATION_THRESHOLD_USD,
      missingUSD: 0,
    };
  }

  // Calcula saldo total em USD de todas as transações confirmadas
  // CONFIRMED = blockchain confirmou o depósito
  // SENT_TO_GLOBAL = já foi consolidado na Global Wallet
  const transactions = await prisma.walletTransaction.findMany({
    where: {
      userId,
      type: "CREDIT",
      status: {
        in: ["CONFIRMED", "SENT_TO_GLOBAL"],
      },
    },
    select: {
      tokenSymbol: true,
      amount: true,
      tokenDecimals: true,
    },
  });

  // Agrupa por token
  const balancesByToken: Record<string, number> = {};

  for (const tx of transactions) {
    const symbol = tx.tokenSymbol;
    const amount = tx.amount.toNumber();

    if (!balancesByToken[symbol]) {
      balancesByToken[symbol] = 0;
    }

    balancesByToken[symbol] += amount;
  }

  console.log(`💰 Saldos do usuário ${userId}:`, balancesByToken);

  // Converte para USD
  const totalUSD = await calculateTotalUSD(balancesByToken);

  console.log(
    `💵 Total depositado: $${totalUSD.toFixed(2)} / $${ACTIVATION_THRESHOLD_USD} USD`
  );

  // Verifica se atingiu o mínimo
  if (totalUSD >= ACTIVATION_THRESHOLD_USD) {
    console.log(`✅ Ativando conta ${userId} - Depósito mínimo atingido!`);

    await prisma.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        activatedAt: new Date(),
      },
    });

    return {
      activated: true,
      currentTotalUSD: totalUSD,
      requiredUSD: ACTIVATION_THRESHOLD_USD,
      missingUSD: 0,
    };
  }

  // Ainda não atingiu o mínimo
  const missingUSD = ACTIVATION_THRESHOLD_USD - totalUSD;

  console.log(
    `⏳ Conta ${userId} ainda precisa de $${missingUSD.toFixed(2)} USD para ativar`
  );

  return {
    activated: false,
    currentTotalUSD: totalUSD,
    requiredUSD: ACTIVATION_THRESHOLD_USD,
    missingUSD,
  };
}
