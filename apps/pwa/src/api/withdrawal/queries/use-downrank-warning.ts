import { useQuery } from "@tanstack/react-query"
import { checkDownrankWarning } from "../client"

export function useDownrankWarning(amount: number, enabled = true) {
  return useQuery({
    queryKey: ["withdrawal", "downrank-warning", amount],
    queryFn: () => checkDownrankWarning(amount),
    enabled: enabled && amount > 0,
    staleTime: 1000 * 30, // 30 seconds
  })
}
