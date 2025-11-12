// User Schema - Types for API responses

// ===== Balance (API Response Types) =====

export interface TokenBalance {
  tokenSymbol: string
  tokenAddress: string | null
  available: string
  locked: string
  blocked: string // Blocked for rank (only for USDC)
  total: string
}

export interface UserBalanceResponse {
  balances: TokenBalance[]
  totalUSD: number
  monthlyYieldPercentage: number
}

// ===== User Account (API Response Types) =====

export type UserStatus = "INACTIVE" | "ACTIVE" | "BLOCKED"

export interface UserAccount {
  id: string
  name: string
  email: string
  status: UserStatus
  activatedAt: string | null
  createdAt: string
  referralCode: string | null
}

// ===== Unified Transactions (API Response Types) =====

export interface UnifiedTransaction {
  id: string
  type: "DEPOSIT" | "WITHDRAWAL" | "COMMISSION"
  tokenSymbol: string
  tokenAddress: string | null
  amount: string
  usdValue: number
  txHash: string | null
  transferTxHash: string | null
  status: "PENDING" | "CONFIRMED" | "SENT_TO_GLOBAL" | "PAID" | "CANCELLED"
  createdAt: string
  // Commission specific fields
  commissionLevel?: number // 0 = self (daily yield), 1-3 = network levels
  fromUserName?: string
  userRank?: "RECRUIT" | "BRONZE" | "SILVER" | "GOLD"
}

export interface UnifiedTransactionsResponse {
  transactions: UnifiedTransaction[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

// ===== Referral (API Response Types) =====

export interface ReferralLinkResponse {
  referralCode: string
  referralLink: string
  message: string
}
