import { z } from "zod"

// User Schema - Types and Zod validation schemas

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

// ===== Transactions (API Response Types) =====

export type TransactionType = "DEPOSIT" | "WITHDRAWAL"
export type TransactionStatus = "PENDING" | "CONFIRMED" | "SENT_TO_GLOBAL"

export interface Transaction {
  id: string
  txHash: string
  tokenSymbol: string
  amount: string
  type: TransactionType
  status: TransactionStatus
  createdAt: string
}

export interface TransactionsResponse {
  transactions: Transaction[]
}

// ===== Withdrawal (Input Schema + Response Types) =====

export const requestWithdrawalSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .min(10, "Minimum withdrawal is $10"),
  destinationAddress: z
    .string()
    .min(1, "Destination address is required")
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
})

export type RequestWithdrawalInput = z.infer<typeof requestWithdrawalSchema>

export interface RequestWithdrawalResponse {
  id: string
  amount: number
  netAmount: number
  fee: number
  destinationAddress: string
  status: "PENDING_APPROVAL"
  requestedAt: string
}

export type MLMRank = "RECRUIT" | "BRONZE" | "SILVER" | "GOLD"
export type LoyaltyTier = "NORMAL" | "FAITHFUL" | "LOYAL" | "VETERAN"

export interface CalculateWithdrawalFeeResponse {
  amount: number
  baseFee: number // % fee based on rank
  progressiveFee: number // % fee based on withdrawal count
  loyaltyDiscount: number // % discount based on loyalty
  totalFeePercentage: number // Total % (baseFee + progressiveFee - loyaltyDiscount)
  totalFeeAmount: number // Actual fee in USD
  netAmount: number // Amount - totalFeeAmount
  rank: MLMRank
  withdrawalCount: number // Number of withdrawals this month
  loyaltyTier: LoyaltyTier
  daysSinceLastWithdrawal: number | null
}

// ===== Referral (API Response Types) =====

export interface ReferralLinkResponse {
  referralCode: string
  referralLink: string
  message: string
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
