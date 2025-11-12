import { useQuery } from "@tanstack/react-query"
import { calculateWithdrawalFee } from "../client"

export function useCalculateWithdrawalFee(amount: number, enabled = true) {
  return useQuery({
    queryKey: ["withdrawal", "calculate-fee", amount],
    queryFn: () => calculateWithdrawalFee({ amount }),
    enabled: enabled && amount > 0,
    staleTime: 1000 * 30, // 30 seconds
  })
}
