// Referral Schema - Types for referral validation

export interface ReferralValidationResponse {
  valid: boolean
  referrer?: {
    id: string
    name: string
    currentRank: string
    totalDirects: number
  }
  message?: string
}
