// MLM Schema - Types and Zod validation schemas

// ===== Base Types =====

export type MLMRank = "RECRUIT" | "BRONZE" | "SILVER" | "GOLD"
export type RankStatus = "ACTIVE" | "WARNING" | "TEMPORARY_DOWNRANK" | "DOWNRANKED"
export type LoyaltyTier = "NORMAL" | "FAITHFUL" | "LOYAL" | "VETERAN"
export type CommissionStatus = "PENDING" | "PAID" | "CANCELLED"

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

// ===== Commissions Summary =====

export interface CommissionsSummary {
  today: number
  thisMonth: number
  total: number
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
  status: CommissionStatus
  createdAt: string
}

export interface RecentCommissionsResponse {
  commissions: RecentCommission[]
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
