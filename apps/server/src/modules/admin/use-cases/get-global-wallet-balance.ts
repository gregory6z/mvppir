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
}

/**
 * Busca saldos de todos os tokens na Global Wallet
 */
export async function getGlobalWalletBalance(): Promise<GlobalWalletBalance> {
  // 1. Buscar Global Wallet
  const globalWallet = await prisma.globalWallet.findFirst({
    include: {
      balances: true,
    },
  });

  if (!globalWallet) {
    throw new Error("GLOBAL_WALLET_NOT_FOUND");
  }

  // 2. Buscar preços em USD (CoinGecko)
  const tokenSymbols = globalWallet.balances.map((b) => b.tokenSymbol);
  const prices = await getPrices(tokenSymbols);

  // 3. Calcular USD values
  const balances = globalWallet.balances.map((b) => {
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

  const totalUsd = balances.reduce((sum, b) => sum + Number(b.usdValue), 0);

  return {
    address: globalWallet.polygonAddress,
    balances,
    totalUsd: totalUsd.toFixed(2),
  };
}
