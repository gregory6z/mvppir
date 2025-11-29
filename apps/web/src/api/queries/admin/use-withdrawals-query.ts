import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getWithdrawals, approveWithdrawal, rejectWithdrawal } from "@/api/client/admin.api"
import { queryKeys } from "@/lib/react-query"

export function useWithdrawals(status?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.admin.withdrawals(status, page),
    queryFn: () => getWithdrawals(status, page, limit),
  })
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => approveWithdrawal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all })
    },
  })
}

export function useRejectWithdrawal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectWithdrawal(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] })
    },
  })
}
