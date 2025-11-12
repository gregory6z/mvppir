export interface WithdrawalFeeRequest {
  amount: number
}

export interface WithdrawalFee {
  amount: number
  baseFee: number
  progressiveFee: number
  loyaltyDiscount: number
  totalFeePercentage: number
  totalFeeAmount: number
  netAmount: number
  rank: "RECRUIT" | "BRONZE" | "SILVER" | "GOLD"
  withdrawalCount: number
  loyaltyTier: "NORMAL" | "BRONZE" | "SILVER" | "GOLD"
  daysSinceLastWithdrawal: number | null
}

export interface WithdrawalRequest {
  amount: number
  polygonAddress: string
}

export interface WithdrawalResponse {
  id: string
  amount: number
  feeAmount: number
  netAmount: number
  polygonAddress: string
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  createdAt: string
}

export interface DownrankWarning {
  willDownrank: boolean
  currentRank: "RECRUIT" | "BRONZE" | "SILVER" | "GOLD"
  newRank: "RECRUIT" | "BRONZE" | "SILVER" | "GOLD"
  currentBalance: number
  balanceAfterWithdrawal: number
  minimumRequired: number
  currentDailyYield: number
  newDailyYield: number
  willBeInactivated: boolean
}
