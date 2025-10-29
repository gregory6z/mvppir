import { apiClient } from "@/lib/api-client";

// User API Services
export interface UserBalance {
  tokenSymbol: string;
  tokenAddress: string | null;
  balance: string;
  usdValue: string;
  lastUpdated: string;
}

export async function getUserBalance(): Promise<{ balances: UserBalance[] }> {
  return apiClient.get("user/balance").json<{ balances: UserBalance[] }>();
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
