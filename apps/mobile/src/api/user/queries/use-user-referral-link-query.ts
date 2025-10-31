import { useQuery } from "@tanstack/react-query"
import { getUserReferralLink, type ReferralLinkResponse } from "@/api/user/client/user.api"

export function useUserReferralLink() {
  return useQuery<ReferralLinkResponse>({
    queryKey: ["user", "referral"],
    queryFn: getUserReferralLink,
    staleTime: 1000 * 60 * 60, // 1 hour (referral code doesn't change often)
  })
}
