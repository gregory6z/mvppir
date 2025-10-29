const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3333";

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
  const response = await fetch(`${API_URL}/referral/validate/${code}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to validate referral code");
  }

  return response.json();
}
