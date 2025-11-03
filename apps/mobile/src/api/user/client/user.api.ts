import { apiClient } from "@/lib/api-client"
import type {
  UserBalanceResponse,
  TransactionsResponse,
  RequestWithdrawalInput,
  RequestWithdrawalResponse,
  CalculateWithdrawalFeeResponse,
  ReferralLinkResponse,
} from "../schemas/user.schema"

// User API Services

// ===== Balance =====

export async function getUserBalance(): Promise<UserBalanceResponse> {
  return apiClient.get("user/balance").json<UserBalanceResponse>()
}

// ===== Transactions =====

export async function getUserTransactions(): Promise<TransactionsResponse> {
  return apiClient.get("user/transactions").json<TransactionsResponse>()
}

// ===== Withdrawal =====

export async function calculateWithdrawalFee(amount: number): Promise<CalculateWithdrawalFeeResponse> {
  return apiClient.get(`user/withdrawals/calculate-fee?amount=${amount}`).json<CalculateWithdrawalFeeResponse>()
}

export async function requestWithdrawal(data: RequestWithdrawalInput): Promise<RequestWithdrawalResponse> {
  return apiClient.post("user/withdrawals/request", { json: data }).json<RequestWithdrawalResponse>()
}

// ===== Referral =====

export async function getUserReferralLink(): Promise<ReferralLinkResponse> {
  return apiClient.get("user/referral").json<ReferralLinkResponse>()
}
