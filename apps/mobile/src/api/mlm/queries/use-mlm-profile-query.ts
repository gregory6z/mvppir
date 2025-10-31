import { useQuery } from "@tanstack/react-query"
import { getMLMProfile } from "@/api/mlm/client/mlm.api"
import type { MLMProfile } from "@/api/mlm/schemas/mlm.schema"

export function useMLMProfile() {
  return useQuery<MLMProfile>({
    queryKey: ["mlm", "profile"],
    queryFn: getMLMProfile,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}
