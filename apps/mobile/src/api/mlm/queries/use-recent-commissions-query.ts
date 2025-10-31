import { useQuery } from "@tanstack/react-query"
import { getRecentCommissions } from "@/api/mlm/client/mlm.api"
import type { RecentCommissionsResponse } from "@/api/mlm/schemas/mlm.schema"

export function useRecentCommissions(limit: number = 10) {
  return useQuery<RecentCommissionsResponse>({
    queryKey: ["mlm", "commissions", "recent", limit],
    queryFn: () => getRecentCommissions(limit),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}
