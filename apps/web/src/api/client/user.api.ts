const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333"

interface ApiResponse<T> {
  data?: T
  error?: string
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }))
      return { error: error.message || `Error ${response.status}` }
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Network error" }
  }
}

// ============== Account ==============
export interface UserAccount {
  id: string
  email: string
  name: string
  status: "INACTIVE" | "ACTIVE" | "BLOCKED"
  role: string
  referralCode: string
  createdAt: string
}

export async function getAccount(): Promise<ApiResponse<UserAccount>> {
  return request<UserAccount>("/user/account")
}

// ============== Balance ==============
export interface TokenBalance {
  tokenSymbol: string
  availableBalance: string
  lockedBalance: string
  totalBalance: string
  usdValue: string
}

export interface BalanceResponse {
  balances: TokenBalance[]
  totalUsdValue: string
}

export async function getBalance(): Promise<ApiResponse<BalanceResponse>> {
  return request<BalanceResponse>("/user/balance")
}

// ============== Transactions ==============
export interface Transaction {
  id: string
  type: "DEPOSIT" | "WITHDRAWAL" | "COMMISSION"
  tokenSymbol: string
  amount: string
  usdValue: string
  status: string
  description?: string
  txHash?: string
  createdAt: string
}

export interface TransactionsResponse {
  transactions: Transaction[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function getTransactions(
  page = 1,
  limit = 20,
  type?: string
): Promise<ApiResponse<TransactionsResponse>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  if (type) params.append("type", type)

  return request<TransactionsResponse>(`/user/transactions/all?${params}`)
}

// ============== Activation Status ==============
export interface ActivationStatus {
  isActivated: boolean
  currentDeposit: string
  requiredDeposit: string
  progress: number
  status: "INACTIVE" | "ACTIVE" | "BLOCKED"
}

export async function getActivationStatus(): Promise<ApiResponse<ActivationStatus>> {
  return request<ActivationStatus>("/user/activation")
}

// ============== User Status ==============
export interface UserStatus {
  status: "INACTIVE" | "ACTIVE" | "BLOCKED"
  activationProgress: number
  currentDeposit: string
  requiredDeposit: string
  totalBalance: string
}

export async function getUserStatus(): Promise<ApiResponse<UserStatus>> {
  return request<UserStatus>("/user/status")
}

// ============== Referral ==============
export interface ReferralInfo {
  referralCode: string
  referralLink: string
  totalReferrals: number
  activeReferrals: number
}

export async function getReferralInfo(): Promise<ApiResponse<ReferralInfo>> {
  return request<ReferralInfo>("/user/referral")
}

// ============== Deposit Address ==============
export interface DepositAddress {
  address: string
  qrCode: string
  network: string
}

export async function getDepositAddress(): Promise<ApiResponse<DepositAddress>> {
  return request<DepositAddress>("/deposit/my-address")
}

// ============== Withdrawal ==============
export interface WithdrawalLimits {
  minAmount: string
  maxAmount: string
  dailyLimit: string
  dailyUsed: string
  dailyRemaining: string
  canWithdraw: boolean
  reason?: string
}

export async function getWithdrawalLimits(): Promise<ApiResponse<WithdrawalLimits>> {
  return request<WithdrawalLimits>("/user/withdrawals/limits")
}

export interface WithdrawalFee {
  amount: string
  fee: string
  feePercentage: number
  netAmount: string
  tokenSymbol: string
}

export async function calculateWithdrawalFee(
  amount: string,
  tokenSymbol: string
): Promise<ApiResponse<WithdrawalFee>> {
  const params = new URLSearchParams({ amount, tokenSymbol })
  return request<WithdrawalFee>(`/user/withdrawals/calculate-fee?${params}`)
}

export interface WithdrawalRequest {
  amount: string
  tokenSymbol: string
  destinationAddress: string
}

export interface WithdrawalResponse {
  id: string
  status: string
  amount: string
  fee: string
  tokenSymbol: string
  destinationAddress: string
  createdAt: string
}

export async function requestWithdrawal(
  data: WithdrawalRequest
): Promise<ApiResponse<WithdrawalResponse>> {
  return request<WithdrawalResponse>("/user/withdrawals/request", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export interface UserWithdrawal {
  id: string
  status: "PENDING_APPROVAL" | "APPROVED" | "PROCESSING" | "COMPLETED" | "REJECTED" | "FAILED"
  amount: string
  fee: string
  tokenSymbol: string
  destinationAddress: string
  txHash?: string
  rejectedReason?: string
  createdAt: string
  updatedAt: string
}

export interface UserWithdrawalsResponse {
  withdrawals: UserWithdrawal[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function getMyWithdrawals(
  page = 1,
  limit = 10
): Promise<ApiResponse<UserWithdrawalsResponse>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  return request<UserWithdrawalsResponse>(`/user/withdrawals?${params}`)
}

// ============== Unblock Balance ==============
export async function unblockBalance(
  tokenSymbol: string
): Promise<ApiResponse<{ success: boolean; unblocked: string }>> {
  return request("/user/balance/unblock", {
    method: "POST",
    body: JSON.stringify({ tokenSymbol }),
  })
}
