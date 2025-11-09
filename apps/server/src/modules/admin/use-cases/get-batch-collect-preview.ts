import { prisma } from "@/lib/prisma";
import { getTokenPriceUSD } from "@/providers/price/price.provider";

interface BatchCollectPreview {
  tokens: Array<{
    tokenSymbol: string;
    walletsCount: number;
    totalAmount: string;
    gasEstimate: string;
    priceUsd: number;
    valueUsd: number;
  }>;
  totalGasEstimate: string;
  maticBalance: string;
  canExecute: boolean;
  totalValueUsd: number;
}

/**
 * Preview do que será coletado no próximo batch collect
 */
export async function getBatchCollectPreview(): Promise<BatchCollectPreview> {
  // 1. Buscar todas as transações CONFIRMED que ainda não foram transferidas
  // Ignora depósitos de teste (isTest: true) - apenas dinheiro real vai para Global Wallet
  const confirmedTransactions = await prisma.walletTransaction.findMany({
    where: {
      status: "CONFIRMED",
      isTest: false, // 🔑 Ignora depósitos de teste
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
  const tokensWithoutPrices = Object.entries(tokenGroups).map(([tokenSymbol, data]) => {
    const walletsCount = data.wallets.size;
    const gasEstimate = walletsCount * GAS_PER_TRANSFER;

    return {
      tokenSymbol,
      walletsCount,
      totalAmount: data.totalAmount.toFixed(8),
      gasEstimate: gasEstimate.toFixed(8),
    };
  });

  // 4. Buscar preços dos tokens em USD
  const tokens = await Promise.all(
    tokensWithoutPrices.map(async (token) => {
      const priceUsd = await getTokenPriceUSD(token.tokenSymbol);
      const valueUsd = Number(token.totalAmount) * priceUsd;

      return {
        ...token,
        priceUsd,
        valueUsd,
      };
    })
  );

  const totalGasEstimate = tokens.reduce(
    (sum, t) => sum + Number(t.gasEstimate),
    0
  );

  // 5. Calcular valor total em USD
  const totalValueUsd = tokens.reduce((sum, t) => sum + t.valueUsd, 0);

  // 6. Buscar saldo de MATIC na Global Wallet
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
    totalValueUsd,
  };
}
