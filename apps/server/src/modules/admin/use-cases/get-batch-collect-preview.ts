import { prisma } from "@/lib/prisma";

interface BatchCollectPreview {
  tokens: Array<{
    tokenSymbol: string;
    walletsCount: number;
    totalAmount: string;
    gasEstimate: string;
  }>;
  totalGasEstimate: string;
  maticBalance: string;
  canExecute: boolean;
}

/**
 * Preview do que será coletado no próximo batch collect
 */
export async function getBatchCollectPreview(): Promise<BatchCollectPreview> {
  // 1. Buscar todas as transações CONFIRMED que ainda não foram transferidas
  const confirmedTransactions = await prisma.walletTransaction.findMany({
    where: {
      status: "CONFIRMED",
    },
    include: {
      depositAddress: true,
    },
  });

  // 2. Agrupar por token
  const tokenGroups = confirmedTransactions.reduce((acc, tx) => {
    if (!acc[tx.tokenSymbol]) {
      acc[tx.tokenSymbol] = {
        wallets: new Set<string>(),
        totalAmount: 0,
      };
    }
    acc[tx.tokenSymbol].wallets.add(tx.depositAddress.polygonAddress);
    acc[tx.tokenSymbol].totalAmount += Number(tx.amount);
    return acc;
  }, {} as Record<string, { wallets: Set<string>; totalAmount: number }>);

  // 3. Estimar gas (0.05 MATIC por transferência - valor aproximado)
  const GAS_PER_TRANSFER = 0.05;
  const tokens = Object.entries(tokenGroups).map(([tokenSymbol, data]) => {
    const walletsCount = data.wallets.size;
    const gasEstimate = walletsCount * GAS_PER_TRANSFER;

    return {
      tokenSymbol,
      walletsCount,
      totalAmount: data.totalAmount.toFixed(8),
      gasEstimate: gasEstimate.toFixed(8),
    };
  });

  const totalGasEstimate = tokens.reduce(
    (sum, t) => sum + Number(t.gasEstimate),
    0
  );

  // 4. Buscar saldo de MATIC na Global Wallet
  const globalWallet = await prisma.globalWallet.findFirst({
    include: {
      balances: {
        where: { tokenSymbol: "MATIC" },
      },
    },
  });

  const maticBalance = globalWallet?.balances[0]?.balance || 0;
  const canExecute = Number(maticBalance) >= totalGasEstimate;

  return {
    tokens,
    totalGasEstimate: totalGasEstimate.toFixed(8),
    maticBalance: maticBalance.toString(),
    canExecute,
  };
}
