import { apiClient } from "@/lib/api-client"

// MLM API Services

// ===== Types =====

export type MLMRank = "RECRUIT" | "BRONZE" | "SILVER" | "GOLD"
export type RankStatus = "ACTIVE" | "WARNING" | "TEMPORARY_DOWNRANK" | "DOWNRANKED"
export type LoyaltyTier = "NORMAL" | "FAITHFUL" | "LOYAL" | "VETERAN"

// ===== MLM Profile =====

export interface MLMProfile {
  user: {
    id: string
    name: string
    email: string
    currentRank: MLMRank
    rankStatus: RankStatus
    rankConqueredAt: string | null
    blockedBalance: number
    loyaltyTier: LoyaltyTier
  }
  network: {
    totalDirects: number
    activeDirects: number
    levels: {
      N1: { count: number; totalBalance: number }
      N2: { count: number; totalBalance: number }
      N3: { count: number; totalBalance: number }
    }
  }
  currentRankRequirements: {
    maintenance: {
      activeDirects: { required: number; actual: number; met: boolean }
      monthlyVolume: { required: number; actual: number; met: boolean }
      blockedBalance: { required: number; actual: number; met: boolean }
    }
    met: boolean
  }
  nextRankPreview?: {
    rank: MLMRank
    canProgress: boolean
    requirements: {
      directs: { required: number; actual: number; met: boolean }
      blockedBalance: { required: number; actual: number; met: boolean }
    }
    missingRequirements: string[]
  }
  warning?: {
    status: RankStatus
    warningCount: number
    gracePeriodEndsAt: string | null
    message: string
  }
  commissionRates: {
    N0: number
    N1: number
    N2: number
    N3: number
  }
}

export async function getMLMProfile(): Promise<MLMProfile> {
  return apiClient.get("mlm/profile").json<MLMProfile>()
}

// ===== Commissions Summary =====

export interface CommissionsSummary {
  today: number
  thisMonth: number
  total: number
}

export async function getCommissionsSummary(): Promise<CommissionsSummary> {
  return apiClient.get("mlm/commissions/summary").json<CommissionsSummary>()
}

// ===== Recent Commissions =====

export interface RecentCommission {
  id: string
  level: number
  fromUserId: string
  fromUserName: string
  baseAmount: number
  percentage: number
  finalAmount: number
  referenceDate: string
  status: "PENDING" | "PAID" | "CANCELLED"
  createdAt: string
}

export interface RecentCommissionsResponse {
  commissions: RecentCommission[]
}

export async function getRecentCommissions(limit: number = 10): Promise<RecentCommissionsResponse> {
  return apiClient.get(`mlm/commissions/recent?limit=${limit}`).json<RecentCommissionsResponse>()
}

// ===== Network =====

export interface NetworkUser {
  id: string
  name: string
  email: string
  currentRank: MLMRank
  totalBalance: number
  joinedAt: string
}

export interface NetworkResponse {
  N1: NetworkUser[]
  N2: NetworkUser[]
  N3: NetworkUser[]
}

export async function getNetwork(): Promise<NetworkResponse> {
  return apiClient.get("mlm/network").json<NetworkResponse>()
}

// ===== Monthly History =====

export interface MonthlyStats {
  month: string
  activeDirects: number
  monthlyVolume: number
  totalCommissions: number
}

export interface MonthlyHistoryResponse {
  history: MonthlyStats[]
}

export async function getMonthlyHistory(): Promise<MonthlyHistoryResponse> {
  return apiClient.get("mlm/monthly-history").json<MonthlyHistoryResponse>()
}
