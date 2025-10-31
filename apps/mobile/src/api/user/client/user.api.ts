import { apiClient } from "@/lib/api-client";

// User API Services
export interface TokenBalance {
  tokenSymbol: string;
  tokenAddress: string | null;
  available: string;
  locked: string;
  blocked: string; // Blocked for rank (only for USDC)
  total: string;
}

export interface UserBalanceResponse {
  balances: TokenBalance[];
  totalUSD: number;
  monthlyYieldPercentage: number;
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

// Withdrawal API
export interface RequestWithdrawalRequest {
  amount: number;
  destinationAddress: string;
}

export interface RequestWithdrawalResponse {
  id: string;
  amount: number;
  netAmount: number;
  fee: number;
  destinationAddress: string;
  status: "PENDING_APPROVAL";
  requestedAt: string;
}

export async function requestWithdrawal(data: RequestWithdrawalRequest): Promise<RequestWithdrawalResponse> {
  return apiClient.post("withdrawal/request", { json: data }).json<RequestWithdrawalResponse>();
}

// Referral API
export interface ReferralLinkResponse {
  referralCode: string;
  referralLink: string;
  message: string;
}

export async function getUserReferralLink(): Promise<ReferralLinkResponse> {
  return apiClient.get("user/referral").json<ReferralLinkResponse>();
}
