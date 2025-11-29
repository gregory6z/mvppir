import { useQuery } from "@tanstack/react-query"
import { getCommissionsSummary } from "@/api/mlm/client/mlm.api"
import type { CommissionsSummary } from "@/api/mlm/schemas/mlm.schema"

export function useCommissionsSummary() {
  return useQuery<CommissionsSummary>({
    queryKey: ["mlm", "commissions", "summary"],
    queryFn: getCommissionsSummary,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}
