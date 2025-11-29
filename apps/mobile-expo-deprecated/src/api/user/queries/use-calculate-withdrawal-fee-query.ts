import { useQuery } from "@tanstack/react-query"
import { calculateWithdrawalFee } from "../client/user.api"

export function useCalculateWithdrawalFee(amount: number, enabled = true) {
  return useQuery({
    queryKey: ["user", "withdrawal-fee", amount],
    queryFn: () => calculateWithdrawalFee(amount),
    enabled: enabled && amount > 0, // Only fetch if amount is provided and enabled
    staleTime: 1000 * 60 * 5, // 5 minutes - fees don't change frequently
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
}
