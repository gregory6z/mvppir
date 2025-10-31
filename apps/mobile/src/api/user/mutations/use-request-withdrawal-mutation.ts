import { useMutation, useQueryClient } from "@tanstack/react-query"
import { requestWithdrawal } from "../client/user.api"
import type { RequestWithdrawalInput } from "../schemas/user.schema"

export function useRequestWithdrawal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RequestWithdrawalInput) => requestWithdrawal(data),
    onSuccess: () => {
      // Invalidate balance and transactions to reflect the locked balance
      queryClient.invalidateQueries({ queryKey: ["user", "balance"] })
      queryClient.invalidateQueries({ queryKey: ["user", "transactions"] })
    },
  })
}
