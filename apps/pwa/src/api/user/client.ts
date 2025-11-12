import { apiClient } from "@/lib/api-client"
import type {
  UserAccount,
  UserBalanceResponse,
  UnifiedTransactionsResponse,
  ReferralLinkResponse,
} from "./schemas"

// User API Services

// ===== Account =====

export async function getUserAccount(): Promise<UserAccount> {
  return apiClient.get("user/account").json<UserAccount>()
}

// ===== Balance =====

export async function getUserBalance(): Promise<UserBalanceResponse> {
  return apiClient.get("user/balance").json<UserBalanceResponse>()
}

// ===== Unified Transactions =====

interface GetUnifiedTransactionsParams {
  limit?: number
  offset?: number
}

export async function getUnifiedTransactions(
  params: GetUnifiedTransactionsParams = {}
): Promise<UnifiedTransactionsResponse> {
  const searchParams = new URLSearchParams()
  if (params.limit) searchParams.append("limit", params.limit.toString())
  if (params.offset) searchParams.append("offset", params.offset.toString())

  const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return apiClient
    .get(`user/transactions/all${query}`)
    .json<UnifiedTransactionsResponse>()
}

// ===== Referral =====

export async function getUserReferralLink(): Promise<ReferralLinkResponse> {
  return apiClient.get("user/referral").json<ReferralLinkResponse>()
}
