import { prisma } from "@/lib/prisma";

interface ValidateReferralCodeResponse {
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
  referralCode: string
): Promise<ValidateReferralCodeResponse> {
  // Validate input
  if (!referralCode || referralCode.trim().length === 0) {
    return {
      valid: false,
      message: "Referral code is required",
    };
  }

  // Normalize code (uppercase, trim)
  const normalizedCode = referralCode.trim().toUpperCase();

  // Find user by referral code
  const referrer = await prisma.user.findUnique({
    where: {
      referralCode: normalizedCode,
    },
    select: {
      id: true,
      name: true,
      currentRank: true,
      totalDirects: true,
      status: true,
    },
  });

  // Code doesn't exist
  if (!referrer) {
    return {
      valid: false,
      message: "Invalid referral code",
    };
  }

  // User is blocked
  if (referrer.status === "BLOCKED") {
    return {
      valid: false,
      message: "This referral code is no longer valid",
    };
  }

  // Valid referral code
  return {
    valid: true,
    referrer: {
      id: referrer.id,
      name: referrer.name,
      currentRank: referrer.currentRank,
      totalDirects: referrer.totalDirects,
    },
  };
}
