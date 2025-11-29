// Referral Schema - Types and Zod validation schemas

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
