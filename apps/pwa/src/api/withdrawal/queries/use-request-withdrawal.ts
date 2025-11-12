import { useMutation, useQueryClient } from "@tanstack/react-query"
import { requestWithdrawal } from "../client"
import type { WithdrawalRequest } from "../schemas"

export function useRequestWithdrawal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: WithdrawalRequest) => requestWithdrawal(data),
    onSuccess: () => {
      // Invalidate user profile and balance queries
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
      queryClient.invalidateQueries({ queryKey: ["user", "balance"] })
      // Invalidate MLM profile if withdrawal affects rank
      queryClient.invalidateQueries({ queryKey: ["mlm", "profile"] })
    },
  })
}
