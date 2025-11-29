import { apiClient } from "@/lib/api-client"
import type {
  MLMProfile,
  CommissionsSummary,
  RecentCommissionsResponse,
  NetworkResponse,
  MonthlyHistoryResponse,
} from "../schemas/mlm.schema"

// MLM API Services

// ===== MLM Profile =====

export async function getMLMProfile(): Promise<MLMProfile> {
  return apiClient.get("mlm/profile").json<MLMProfile>()
}

// ===== Commissions Summary =====

export async function getCommissionsSummary(): Promise<CommissionsSummary> {
  return apiClient.get("mlm/commissions/summary").json<CommissionsSummary>()
}

// ===== Recent Commissions =====

export async function getRecentCommissions(limit: number = 10): Promise<RecentCommissionsResponse> {
  return apiClient.get(`mlm/commissions/recent?limit=${limit}`).json<RecentCommissionsResponse>()
}

// ===== Network =====

export async function getNetwork(): Promise<NetworkResponse> {
  return apiClient.get("mlm/network").json<NetworkResponse>()
}

// ===== Monthly History =====

export async function getMonthlyHistory(): Promise<MonthlyHistoryResponse> {
  return apiClient.get("mlm/monthly-history").json<MonthlyHistoryResponse>()
}
