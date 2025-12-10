import { prisma } from "@/lib/prisma";
import { getTokenPriceUSD } from "@/providers/price/price.provider";
import { getBatchOnChainBalances, OnChainBalanceResult } from "@/providers/blockchain/balance.provider";
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
    tokenAddress: string | null;
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
  walletsWithBalance: number;
  source: "blockchain"; // Indica que dados vêm da blockchain
}

// Gas units estimados (valores típicos na Polygon)
const GAS_UNITS = {
  NATIVE_TRANSFER: 21000n,      // Enviar MATIC nativo
  ERC20_TRANSFER: 65000n,       // Transferir token ERC20
};

/**
 * Preview do que será coletado no próximo batch collect
 * CONSULTA DIRETAMENTE NA BLOCKCHAIN - não depende de dados no banco
 */
export async function getBatchCollectPreview(): Promise<BatchCollectPreview> {
  console.log("🔍 [BatchCollectPreview] Iniciando consulta on-chain...");

  // 1. Conectar ao provider para buscar gas price atual
  const provider = new JsonRpcProvider(env.POLYGON_RPC_URL);

  let gasPriceWei: bigint;
  let gasPriceGwei: string;

  try {
    const feeData = await provider.getFeeData();
    gasPriceWei = feeData.gasPrice || 30000000000n; // 30 gwei fallback
    gasPriceGwei = formatUnits(gasPriceWei, "gwei");
    console.log(`⛽ Gas price: ${gasPriceGwei} gwei`);
  } catch {
    gasPriceWei = 30000000000n; // 30 gwei fallback
    gasPriceGwei = "30";
  }

  // 2. Buscar TODOS os endereços de depósito ativos do banco
  const depositAddresses = await prisma.depositAddress.findMany({
    where: { status: "ACTIVE" },
    select: { polygonAddress: true },
  });

  console.log(`📬 Encontrados ${depositAddresses.length} endereços de depósito ativos`);

  if (depositAddresses.length === 0) {
    return emptyPreview(gasPriceGwei, 0, 0);
  }

  // 3. Consultar saldos ON-CHAIN de todos os endereços
  const addresses = depositAddresses.map(d => d.polygonAddress);
  const onChainBalances = await getBatchOnChainBalances(addresses);

  // 4. Filtrar endereços com saldo significativo e agrupar por token
  const tokenGroups: Record<string, {
    wallets: Set<string>;
    totalAmount: number;
    tokenAddress: string | null;
  }> = {};

  let walletsWithBalance = 0;

  for (const [address, result] of onChainBalances.entries()) {
    const hasSignificantBalance = hasAnySignificantBalance(result);

    if (!hasSignificantBalance) continue;

    walletsWithBalance++;

    // Processa cada saldo do endereço
    for (const balance of result.balances) {
      const amount = parseFloat(balance.balance);

      // Ignora saldos muito pequenos
      if (balance.tokenSymbol === "MATIC" && amount < 0.001) continue;
      if (balance.tokenSymbol !== "MATIC" && amount < 0.01) continue;

      if (!tokenGroups[balance.tokenSymbol]) {
        tokenGroups[balance.tokenSymbol] = {
          wallets: new Set<string>(),
          totalAmount: 0,
          tokenAddress: balance.tokenAddress,
        };
      }

      tokenGroups[balance.tokenSymbol].wallets.add(address);
      tokenGroups[balance.tokenSymbol].totalAmount += amount;
    }
  }

  console.log(`💰 ${walletsWithBalance} endereços com saldo, ${Object.keys(tokenGroups).length} tokens diferentes`);

  // 5. Contar carteiras únicas e tokens ERC20
  const uniqueWallets = new Set<string>();
  let erc20TokenCount = 0;

  for (const [tokenSymbol, data] of Object.entries(tokenGroups)) {
    data.wallets.forEach(w => uniqueWallets.add(w));
    if (tokenSymbol !== "MATIC") {
      erc20TokenCount += data.wallets.size;
    }
  }

  const walletsCount = uniqueWallets.size;

  if (walletsCount === 0) {
    return emptyPreview(gasPriceGwei, 0, 0);
  }

  // 6. Calcular gas breakdown (em MATIC)
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

  // 7. Calcular gas estimate por token
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
      tokenAddress: data.tokenAddress,
      walletsCount: tokenWalletsCount,
      totalAmount: data.totalAmount.toFixed(8),
      gasEstimate: gasEstimateMatic,
    };
  });

  // 8. Buscar preços dos tokens em USD
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

  // 9. Buscar saldo de MATIC na Global Wallet (banco)
  const globalWallet = await prisma.globalWallet.findFirst({
    include: {
      balances: {
        where: { tokenSymbol: "MATIC" },
      },
    },
  });

  const maticBalance = globalWallet?.balances[0]?.balance || 0;

  // 10. Buscar saldo de MATIC on-chain (real) da Global Wallet
  let maticBalanceOnChain = "0";
  if (globalWallet?.polygonAddress) {
    try {
      const balance = await provider.getBalance(globalWallet.polygonAddress);
      maticBalanceOnChain = formatEther(balance);
    } catch {
      maticBalanceOnChain = maticBalance.toString();
    }
  }

  // 11. Verificar se pode executar (precisa de 20% de margem)
  const marginMultiplier = 1.2; // 20% de margem de segurança
  const requiredMatic = totalGasEstimate * marginMultiplier;
  const canExecute = Number(maticBalanceOnChain) >= requiredMatic;

  console.log(`✅ Preview completo: ${tokens.length} tokens, ${walletsWithBalance} carteiras, canExecute: ${canExecute}`);

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
    walletsWithBalance,
    source: "blockchain",
  };
}

/**
 * Verifica se um endereço tem saldo significativo
 */
function hasAnySignificantBalance(result: OnChainBalanceResult): boolean {
  // Tem MATIC > 0.001 ou tem tokens ERC20 com saldo
  const hasMatic = parseFloat(result.totalMaticBalance) > 0.001;
  const hasTokens = result.balances.some(
    b => b.tokenSymbol !== "MATIC" && parseFloat(b.balance) > 0.01
  );
  return hasMatic || hasTokens;
}

/**
 * Retorna preview vazio quando não há nada para coletar
 */
function emptyPreview(
  gasPriceGwei: string,
  maticPriceUsd: number,
  maticBalanceOnChain: number
): BatchCollectPreview {
  return {
    tokens: [],
    totalGasEstimate: "0",
    maticBalance: "0",
    maticBalanceOnChain: maticBalanceOnChain.toString(),
    canExecute: false,
    totalValueUsd: 0,
    gasBreakdown: {
      distributeMaticGas: "0",
      collectTokensGas: "0",
      recoverMaticGas: "0",
      totalPerWallet: "0",
    },
    gasPriceGwei,
    maticPriceUsd,
    totalGasCostUsd: 0,
    walletsWithBalance: 0,
    source: "blockchain",
  };
}
