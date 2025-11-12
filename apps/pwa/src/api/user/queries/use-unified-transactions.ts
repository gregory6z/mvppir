import { useQuery } from "@tanstack/react-query"
import { getUnifiedTransactions } from "../client"
import type { UnifiedTransactionsResponse } from "../schemas"

interface UseUnifiedTransactionsParams {
  limit?: number
  offset?: number
}

export function useUnifiedTransactions(params: UseUnifiedTransactionsParams = {}) {
  return useQuery<UnifiedTransactionsResponse>({
    queryKey: ["user", "transactions", "all", params],
    queryFn: () => getUnifiedTransactions(params),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}
