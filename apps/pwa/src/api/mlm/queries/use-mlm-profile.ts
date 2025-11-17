import { useQuery} from "@tanstack/react-query"
import { getMLMProfile } from "../client"
import type { MLMProfile } from "../schemas"

export function useMLMProfile() {
  return useQuery<MLMProfile>({
    queryKey: ["mlm", "profile"],
    queryFn: getMLMProfile,
    staleTime: 1000 * 10, // 10 seconds (was 1 minute)
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  })
}
