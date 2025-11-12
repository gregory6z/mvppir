import { useQuery } from "@tanstack/react-query"
import { getUserReferralLink } from "../client"
import type { ReferralLinkResponse } from "../schemas"

export function useUserReferralLink() {
  return useQuery<ReferralLinkResponse>({
    queryKey: ["user", "referral"],
    queryFn: getUserReferralLink,
    staleTime: 1000 * 60 * 60, // 1 hour (referral code doesn't change often)
  })
}
