import { prisma } from "@/lib/prisma";
import { getPrices } from "@/providers/price/price.provider";

interface MaticStatus {
  balance: string;
  usdValue: string;
  estimates: {
    pendingWithdrawals: string;
    nextBatchCollect: string;
    recommended: string;
  };
  status: "OK" | "WARNING" | "CRITICAL";
  globalWalletAddress: string;
}

/**
 * Retorna status do MATIC na Global Wallet
 */
export async function getMaticStatus(): Promise<MaticStatus> {
  // 1. Buscar saldo de MATIC na Global Wallet
  const globalWallet = await prisma.globalWallet.findFirst({
    include: {
      balances: {
        where: { tokenSymbol: "MATIC" },
      },
    },
  });

  if (!globalWallet) {
    throw new Error("GLOBAL_WALLET_NOT_FOUND");
  }

  const maticBalance = globalWallet.balances[0]?.balance || 0;

  // 2. Estimar consumo para saques pendentes
  const pendingWithdrawals = await prisma.withdrawal.count({
    where: { status: "APPROVED" },
  });
  const pendingWithdrawalsGas = pendingWithdrawals * 0.05; // 0.05 MATIC por saque

  // 3. Estimar próximo batch collect
  const confirmedCount = await prisma.walletTransaction.count({
    where: { status: "CONFIRMED" },
  });
  const nextBatchCollectGas = confirmedCount * 0.05;

  // 4. Reserva recomendada
  const recommended = 50;

  // 5. Calcular status
  const balanceNum = Number(maticBalance);
  let status: "OK" | "WARNING" | "CRITICAL";
  if (balanceNum >= 50) status = "OK";
  else if (balanceNum >= 10) status = "WARNING";
  else status = "CRITICAL";

  // 6. Buscar preço do MATIC
  const prices = await getPrices(["MATIC"]);
  const usdValue = balanceNum * (prices.MATIC || 0);

  return {
    balance: maticBalance.toString(),
    usdValue: usdValue.toFixed(2),
    estimates: {
      pendingWithdrawals: pendingWithdrawalsGas.toFixed(8),
      nextBatchCollect: nextBatchCollectGas.toFixed(8),
      recommended: recommended.toString(),
    },
    status,
    globalWalletAddress: globalWallet.polygonAddress,
  };
}
