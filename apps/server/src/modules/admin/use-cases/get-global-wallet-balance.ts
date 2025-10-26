import { prisma } from "@/lib/prisma";
import { getPrices } from "@/providers/price/price.provider";

interface GlobalWalletBalance {
  address: string;
  balances: Array<{
    tokenSymbol: string;
    tokenAddress: string | null;
    balance: string;
    usdValue: string;
    lastUpdated: string;
  }>;
  totalUsd: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface GetGlobalWalletBalanceParams {
  page?: number;
  limit?: number;
}

/**
 * Busca saldos de todos os tokens na Global Wallet com paginação
 */
export async function getGlobalWalletBalance(
  params: GetGlobalWalletBalanceParams = {}
): Promise<GlobalWalletBalance> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 10;
  const skip = (page - 1) * limit;

  // 1. Buscar Global Wallet
  const globalWallet = await prisma.globalWallet.findFirst();

  if (!globalWallet) {
    throw new Error("GLOBAL_WALLET_NOT_FOUND");
  }

  // 2. Contar total de tokens
  const totalTokens = await prisma.globalWalletBalance.count({
    where: { globalWalletId: globalWallet.id },
  });

  // 3. Buscar tokens paginados
  const balanceRecords = await prisma.globalWalletBalance.findMany({
    where: { globalWalletId: globalWallet.id },
    skip,
    take: limit,
    orderBy: { updatedAt: "desc" },
  });

  // 4. Buscar preços em USD (CoinGecko)
  const tokenSymbols = balanceRecords.map((b) => b.tokenSymbol);
  const prices = await getPrices(tokenSymbols);

  // 5. Calcular USD values
  const balances = balanceRecords.map((b) => {
    const usdPrice = prices[b.tokenSymbol] || 0;
    const usdValue = Number(b.balance) * usdPrice;

    return {
      tokenSymbol: b.tokenSymbol,
      tokenAddress: b.tokenAddress,
      balance: b.balance.toString(),
      usdValue: usdValue.toFixed(2),
      lastUpdated: b.updatedAt.toISOString(),
    };
  });

  // 6. Calcular total USD de TODOS os tokens (não apenas da página atual)
  const allBalances = await prisma.globalWalletBalance.findMany({
    where: { globalWalletId: globalWallet.id },
  });

  const allTokenSymbols = allBalances.map((b) => b.tokenSymbol);
  const allPrices = await getPrices(allTokenSymbols);

  const totalUsd = allBalances.reduce((sum, b) => {
    const usdPrice = allPrices[b.tokenSymbol] || 0;
    return sum + Number(b.balance) * usdPrice;
  }, 0);

  return {
    address: globalWallet.polygonAddress,
    balances,
    totalUsd: totalUsd.toFixed(2),
    pagination: {
      page,
      limit,
      total: totalTokens,
      totalPages: Math.ceil(totalTokens / limit),
    },
  };
}
