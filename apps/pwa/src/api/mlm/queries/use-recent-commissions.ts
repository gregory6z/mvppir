import { useQuery } from "@tanstack/react-query"
import { getRecentCommissions } from "../client"
import type { RecentCommissionsResponse } from "../schemas"

export function useRecentCommissions(limit: number = 10) {
  return useQuery<RecentCommissionsResponse>({
    queryKey: ["mlm", "commissions", "recent", limit],
    queryFn: () => getRecentCommissions(limit),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}
