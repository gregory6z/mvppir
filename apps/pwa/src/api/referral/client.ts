import type { ReferralValidationResponse } from "./schemas"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333"

export async function validateReferralCode(
  code: string
): Promise<ReferralValidationResponse> {
  const response = await fetch(`${API_URL}/referral/validate/${code}`)

  if (!response.ok) {
    throw new Error("Failed to validate referral code")
  }

  return response.json()
}
