import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getAccount,
  getBalance,
  getTransactions,
  getActivationStatus,
  getUserStatus,
  getReferralInfo,
  getDepositAddress,
  getWithdrawalLimits,
  calculateWithdrawalFee,
  requestWithdrawal,
  getMyWithdrawals,
  unblockBalance,
  type WithdrawalRequest,
} from "@/api/client/user.api"

// ============== Account ==============
export function useAccount() {
  return useQuery({
    queryKey: ["user", "account"],
    queryFn: async () => {
      const result = await getAccount()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============== Balance ==============
export function useBalance() {
  return useQuery({
    queryKey: ["user", "balance"],
    queryFn: async () => {
      const result = await getBalance()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  })
}

// ============== Transactions ==============
export function useTransactions(page = 1, limit = 20, type?: string) {
  return useQuery({
    queryKey: ["user", "transactions", { page, limit, type }],
    queryFn: async () => {
      const result = await getTransactions(page, limit, type)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    staleTime: 30 * 1000,
  })
}

// ============== Activation Status ==============
export function useActivationStatus() {
  return useQuery({
    queryKey: ["user", "activation"],
    queryFn: async () => {
      const result = await getActivationStatus()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    staleTime: 60 * 1000,
  })
}

// ============== User Status ==============
export function useUserStatus() {
  return useQuery({
    queryKey: ["user", "status"],
    queryFn: async () => {
      const result = await getUserStatus()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    staleTime: 60 * 1000,
  })
}

// ============== Referral ==============
export function useReferralInfo() {
  return useQuery({
    queryKey: ["user", "referral"],
    queryFn: async () => {
      const result = await getReferralInfo()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    staleTime: 5 * 60 * 1000,
  })
}

// ============== Deposit Address ==============
export function useDepositAddress() {
  return useQuery({
    queryKey: ["user", "deposit-address"],
    queryFn: async () => {
      const result = await getDepositAddress()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    staleTime: Infinity, // Address never changes
  })
}

// ============== Withdrawal Limits ==============
export function useWithdrawalLimits() {
  return useQuery({
    queryKey: ["user", "withdrawal-limits"],
    queryFn: async () => {
      const result = await getWithdrawalLimits()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    staleTime: 60 * 1000,
  })
}

// ============== Calculate Fee ==============
export function useCalculateWithdrawalFee(amount: string, tokenSymbol: string, enabled: boolean) {
  return useQuery({
    queryKey: ["user", "withdrawal-fee", { amount, tokenSymbol }],
    queryFn: async () => {
      const result = await calculateWithdrawalFee(amount, tokenSymbol)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: enabled && !!amount && !!tokenSymbol && parseFloat(amount) > 0,
    staleTime: 10 * 1000,
  })
}

// ============== Request Withdrawal ==============
export function useRequestWithdrawal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: WithdrawalRequest) => {
      const result = await requestWithdrawal(data)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "balance"] })
      queryClient.invalidateQueries({ queryKey: ["user", "withdrawals"] })
      queryClient.invalidateQueries({ queryKey: ["user", "withdrawal-limits"] })
    },
  })
}

// ============== My Withdrawals ==============
export function useMyWithdrawals(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["user", "withdrawals", { page, limit }],
    queryFn: async () => {
      const result = await getMyWithdrawals(page, limit)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    staleTime: 30 * 1000,
  })
}

// ============== Unblock Balance ==============
export function useUnblockBalance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tokenSymbol: string) => {
      const result = await unblockBalance(tokenSymbol)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "balance"] })
    },
  })
}
