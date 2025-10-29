import { apiClient } from "@/lib/api-client";

// User API Services
export interface TokenBalance {
  tokenSymbol: string;
  tokenAddress: string | null;
  available: string;
  locked: string;
  total: string;
}

export interface UserBalanceResponse {
  balances: TokenBalance[];
  totalUSD: number;
}

export async function getUserBalance(): Promise<UserBalanceResponse> {
  return apiClient.get("user/balance").json<UserBalanceResponse>();
}

export interface Transaction {
  id: string;
  txHash: string;
  tokenSymbol: string;
  amount: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  status: "PENDING" | "CONFIRMED" | "SENT_TO_GLOBAL";
  createdAt: string;
}

export async function getUserTransactions(): Promise<{ transactions: Transaction[] }> {
  return apiClient.get("user/transactions").json<{ transactions: Transaction[] }>();
}
