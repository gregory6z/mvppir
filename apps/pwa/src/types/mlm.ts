export type MLMRank = "RECRUIT" | "BRONZE" | "SILVER" | "GOLD"

export type RankStatus = "ACTIVE" | "WARNING" | "TEMPORARY_DOWNRANK" | "DOWNRANKED"

export type LoyaltyTier = "NORMAL" | "FAITHFUL" | "LOYAL" | "VETERAN"

export interface CommissionsSummary {
  today: number
  thisMonth: number
  total: number
  byLevel: {
    N0: number
    N1: number
    N2: number
    N3: number
  }
}

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
    lifetimeVolume: number
    monthlyVolume: number
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
      lifetimeVolume: { required: number; actual: number; met: boolean }
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
