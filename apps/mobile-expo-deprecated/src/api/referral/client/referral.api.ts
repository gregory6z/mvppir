import { apiClient } from "@/lib/api-client"
import type { ReferralValidationResponse } from "../schemas/referral.schema"

export async function validateReferralCode(
  code: string
): Promise<ReferralValidationResponse> {
  return apiClient.get(`referral/validate/${code}`).json<ReferralValidationResponse>()
}
