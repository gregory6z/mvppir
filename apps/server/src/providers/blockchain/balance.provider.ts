import { ethers } from "ethers";
import { env } from "@/config/env";

// ERC20 ABI mínimo para consultar saldo
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

// Tokens conhecidos na Polygon para consultar
const TOKENS_TO_CHECK = [
  {
    address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC (Native)
    symbol: "USDC",
    decimals: 6,
  },
  {
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC.e (Bridged)
    symbol: "USDC.e",
    decimals: 6,
  },
  {
    address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT
    symbol: "USDT",
    decimals: 6,
  },
  {
    address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH
    symbol: "WETH",
    decimals: 18,
  },
];

export interface OnChainBalance {
  tokenSymbol: string;
  tokenAddress: string | null;
  balance: string;
  rawBalance: string;
  decimals: number;
}

export interface OnChainBalanceResult {
  address: string;
  balances: OnChainBalance[];
  totalMaticBalance: string;
  timestamp: string;
}

/**
 * Consulta saldo de MATIC (nativo) de um endereço
 */
export async function getMaticBalance(address: string): Promise<string> {
  const provider = new ethers.JsonRpcProvider(env.POLYGON_RPC_URL);
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

/**
 * Consulta saldo de um token ERC20 específico
 */
export async function getTokenBalance(
  walletAddress: string,
  tokenAddress: string,
  decimals: number
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(env.POLYGON_RPC_URL);
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

  try {
    const balance = await contract.balanceOf(walletAddress);
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error(`Error fetching balance for token ${tokenAddress}:`, error);
    return "0";
  }
}

/**
 * Consulta todos os saldos on-chain de um endereço (MATIC + tokens conhecidos)
 */
export async function getAllOnChainBalances(
  walletAddress: string
): Promise<OnChainBalanceResult> {
  const provider = new ethers.JsonRpcProvider(env.POLYGON_RPC_URL);

  // Consulta MATIC nativo
  const maticBalance = await provider.getBalance(walletAddress);
  const maticFormatted = ethers.formatEther(maticBalance);

  const balances: OnChainBalance[] = [
    {
      tokenSymbol: "MATIC",
      tokenAddress: null,
      balance: maticFormatted,
      rawBalance: maticBalance.toString(),
      decimals: 18,
    },
  ];

  // Consulta tokens ERC20 em paralelo
  const tokenPromises = TOKENS_TO_CHECK.map(async (token) => {
    try {
      const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
      const balance = await contract.balanceOf(walletAddress);
      const formatted = ethers.formatUnits(balance, token.decimals);

      // Só adiciona se tiver saldo > 0
      if (balance > 0n) {
        return {
          tokenSymbol: token.symbol,
          tokenAddress: token.address,
          balance: formatted,
          rawBalance: balance.toString(),
          decimals: token.decimals,
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching ${token.symbol} balance:`, error);
      return null;
    }
  });

  const tokenBalances = await Promise.all(tokenPromises);

  // Filtra tokens com saldo
  tokenBalances.forEach((tb) => {
    if (tb) balances.push(tb);
  });

  return {
    address: walletAddress,
    balances,
    totalMaticBalance: maticFormatted,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Consulta saldo on-chain de múltiplos endereços
 */
export async function getBatchOnChainBalances(
  addresses: string[]
): Promise<Map<string, OnChainBalanceResult>> {
  const results = new Map<string, OnChainBalanceResult>();

  // Processa em lotes de 10 para não sobrecarregar o RPC
  const batchSize = 10;
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((addr) => getAllOnChainBalances(addr))
    );

    batchResults.forEach((result, idx) => {
      results.set(batch[idx], result);
    });
  }

  return results;
}
