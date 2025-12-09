import { prisma } from "@/lib/prisma";
import { getPrices } from "@/providers/price/price.provider";
import { getAllOnChainBalances } from "@/providers/blockchain/balance.provider";

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
  maticBalance: string;
  maticUsdValue: string;
}

/**
 * Busca saldos on-chain da Global Wallet diretamente da rede Polygon
 */
export async function getGlobalWalletBalance(): Promise<GlobalWalletBalance> {
  // 1. Buscar Global Wallet do banco (apenas para pegar o endereço)
  const globalWallet = await prisma.globalWallet.findFirst();

  if (!globalWallet) {
    throw new Error("GLOBAL_WALLET_NOT_FOUND");
  }

  // 2. Buscar saldos diretamente da blockchain
  const onChainBalances = await getAllOnChainBalances(
    globalWallet.polygonAddress
  );

  // 3. Buscar preços em USD (CoinGecko)
  const tokenSymbols = onChainBalances.balances.map((b) => b.tokenSymbol);
  const prices = await getPrices(tokenSymbols);

  // 4. Calcular USD values para cada token
  let totalUsd = 0;
  const balances = onChainBalances.balances.map((b) => {
    const usdPrice = prices[b.tokenSymbol] || 0;
    const usdValue = Number(b.balance) * usdPrice;
    totalUsd += usdValue;

    return {
      tokenSymbol: b.tokenSymbol,
      tokenAddress: b.tokenAddress,
      balance: b.balance,
      usdValue: usdValue.toFixed(2),
      lastUpdated: onChainBalances.timestamp,
    };
  });

  // 5. Extrair saldo de MATIC separadamente para o card de gas
  const maticBalance = onChainBalances.totalMaticBalance;
  const maticUsdValue = (Number(maticBalance) * (prices["MATIC"] || 0)).toFixed(
    2
  );

  return {
    address: globalWallet.polygonAddress,
    balances,
    totalUsd: totalUsd.toFixed(2),
    maticBalance,
    maticUsdValue,
  };
}
