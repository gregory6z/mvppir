import { prisma } from "@/lib/prisma";
import { getTokenPriceUSD } from "@/providers/price/price.provider";
import { JsonRpcProvider, formatEther, formatUnits } from "ethers";
import { env } from "@/config/env";

interface GasBreakdown {
  distributeMaticGas: string;      // Gas para enviar MATIC (por carteira)
  collectTokensGas: string;        // Gas para coletar tokens (por token)
  recoverMaticGas: string;         // Gas para recuperar MATIC
  totalPerWallet: string;          // Total por carteira
}

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
  maticBalanceOnChain: string;     // Saldo real on-chain
  canExecute: boolean;
  totalValueUsd: number;
  gasBreakdown: GasBreakdown;
  gasPriceGwei: string;
  maticPriceUsd: number;
  totalGasCostUsd: number;
}

// Gas units estimados (valores típicos na Polygon)
const GAS_UNITS = {
  NATIVE_TRANSFER: 21000n,      // Enviar MATIC nativo
  ERC20_TRANSFER: 65000n,       // Transferir token ERC20
};

/**
 * Preview do que será coletado no próximo batch collect
 * Calcula gas preciso usando preço atual da rede
 */
export async function getBatchCollectPreview(): Promise<BatchCollectPreview> {
  // 1. Conectar ao provider para buscar gas price atual
  const provider = new JsonRpcProvider(env.POLYGON_RPC_URL);

  let gasPriceWei: bigint;
  let gasPriceGwei: string;

  try {
    const feeData = await provider.getFeeData();
    gasPriceWei = feeData.gasPrice || 30000000000n; // 30 gwei fallback
    gasPriceGwei = formatUnits(gasPriceWei, "gwei");
  } catch {
    gasPriceWei = 30000000000n; // 30 gwei fallback
    gasPriceGwei = "30";
  }

  // 2. Buscar todas as transações CONFIRMED que ainda não foram transferidas
  const confirmedTransactions = await prisma.walletTransaction.findMany({
    where: {
      status: "CONFIRMED",
      isTest: false,
    },
    include: {
      depositAddress: true,
    },
  });

  // 3. Agrupar por token e carteira
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

  // 4. Contar carteiras únicas e tokens ERC20
  const uniqueWallets = new Set<string>();
  let erc20TokenCount = 0;

  for (const [tokenSymbol, data] of Object.entries(tokenGroups)) {
    data.wallets.forEach(w => uniqueWallets.add(w));
    if (tokenSymbol !== "MATIC") {
      erc20TokenCount += data.wallets.size;
    }
  }

  const walletsCount = uniqueWallets.size;

  // 5. Calcular gas breakdown (em MATIC)
  // Fase 1: Distribuir MATIC (1 tx por carteira com tokens ERC20)
  const distributeGasUnits = BigInt(walletsCount) * GAS_UNITS.NATIVE_TRANSFER;
  const distributeGasCost = distributeGasUnits * gasPriceWei;

  // Fase 2: Coletar tokens ERC20 (1 tx por token por carteira)
  const collectGasUnits = BigInt(erc20TokenCount) * GAS_UNITS.ERC20_TRANSFER;
  const collectGasCost = collectGasUnits * gasPriceWei;

  // Fase 3: Recuperar MATIC (1 tx por carteira)
  const recoverGasUnits = BigInt(walletsCount) * GAS_UNITS.NATIVE_TRANSFER;
  const recoverGasCost = recoverGasUnits * gasPriceWei;

  // Total
  const totalGasCost = distributeGasCost + collectGasCost + recoverGasCost;

  const gasBreakdown: GasBreakdown = {
    distributeMaticGas: formatEther(distributeGasCost),
    collectTokensGas: formatEther(collectGasCost),
    recoverMaticGas: formatEther(recoverGasCost),
    totalPerWallet: walletsCount > 0
      ? formatEther(totalGasCost / BigInt(walletsCount))
      : "0",
  };

  // 6. Calcular gas estimate por token
  const tokensWithoutPrices = Object.entries(tokenGroups).map(([tokenSymbol, data]) => {
    const tokenWalletsCount = data.wallets.size;

    // Gas para este token: distribuir + coletar + recuperar (proporcionalmente)
    let gasUnits: bigint;
    if (tokenSymbol === "MATIC") {
      // MATIC nativo: só recuperar
      gasUnits = BigInt(tokenWalletsCount) * GAS_UNITS.NATIVE_TRANSFER;
    } else {
      // ERC20: distribuir + coletar + recuperar
      gasUnits = BigInt(tokenWalletsCount) * (
        GAS_UNITS.NATIVE_TRANSFER +  // distribuir
        GAS_UNITS.ERC20_TRANSFER +   // coletar
        GAS_UNITS.NATIVE_TRANSFER    // recuperar
      );
    }

    const gasEstimateMatic = formatEther(gasUnits * gasPriceWei);

    return {
      tokenSymbol,
      walletsCount: tokenWalletsCount,
      totalAmount: data.totalAmount.toFixed(8),
      gasEstimate: gasEstimateMatic,
    };
  });

  // 7. Buscar preços dos tokens em USD
  const [maticPriceUsd, ...tokenPrices] = await Promise.all([
    getTokenPriceUSD("MATIC"),
    ...tokensWithoutPrices.map(t => getTokenPriceUSD(t.tokenSymbol)),
  ]);

  const tokens = tokensWithoutPrices.map((token, index) => {
    const priceUsd = tokenPrices[index];
    const valueUsd = Number(token.totalAmount) * priceUsd;

    return {
      ...token,
      priceUsd,
      valueUsd,
    };
  });

  const totalGasEstimate = Number(formatEther(totalGasCost));
  const totalValueUsd = tokens.reduce((sum, t) => sum + t.valueUsd, 0);
  const totalGasCostUsd = totalGasEstimate * maticPriceUsd;

  // 8. Buscar saldo de MATIC na Global Wallet (banco)
  const globalWallet = await prisma.globalWallet.findFirst({
    include: {
      balances: {
        where: { tokenSymbol: "MATIC" },
      },
    },
  });

  const maticBalance = globalWallet?.balances[0]?.balance || 0;

  // 9. Buscar saldo de MATIC on-chain (real)
  let maticBalanceOnChain = "0";
  if (globalWallet?.polygonAddress) {
    try {
      const balance = await provider.getBalance(globalWallet.polygonAddress);
      maticBalanceOnChain = formatEther(balance);
    } catch {
      maticBalanceOnChain = maticBalance.toString();
    }
  }

  // 10. Verificar se pode executar (precisa de 20% de margem)
  const marginMultiplier = 1.2; // 20% de margem de segurança
  const requiredMatic = totalGasEstimate * marginMultiplier;
  const canExecute = Number(maticBalanceOnChain) >= requiredMatic;

  return {
    tokens,
    totalGasEstimate: totalGasEstimate.toFixed(8),
    maticBalance: maticBalance.toString(),
    maticBalanceOnChain,
    canExecute,
    totalValueUsd,
    gasBreakdown,
    gasPriceGwei,
    maticPriceUsd,
    totalGasCostUsd,
  };
}
