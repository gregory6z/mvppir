import { apiClient } from "@/lib/api-client";

export interface ReferralValidationResponse {
  valid: boolean;
  referrer?: {
    id: string;
    name: string;
    currentRank: string;
    totalDirects: number;
  };
  message?: string;
}

export async function validateReferralCode(
  code: string
): Promise<ReferralValidationResponse> {
  return apiClient.get(`referral/validate/${code}`).json<ReferralValidationResponse>();
}
