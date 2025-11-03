import { prisma } from "@/lib/prisma";
import {
  calculateWithdrawalFee as calculateFeeFromConfig,
  calculateLoyaltyTier,
  getRankRequirements,
} from "@/modules/mlm/mlm-config";
import { MLMRank, LoyaltyTier } from "@prisma/client";

interface CalculateWithdrawalFeeRequest {
  userId: string;
  amount: number; // Amount to withdraw in USD
}

interface CalculateWithdrawalFeeResponse {
  amount: number;
  baseFee: number; // % fee based on rank
  progressiveFee: number; // % fee based on withdrawal count
  loyaltyDiscount: number; // % discount based on loyalty
  totalFeePercentage: number; // Total % (baseFee + progressiveFee - loyaltyDiscount)
  totalFeeAmount: number; // Actual fee in USD
  netAmount: number; // Amount - totalFeeAmount
  rank: MLMRank;
  withdrawalCount: number; // Number of withdrawals this month
  loyaltyTier: LoyaltyTier;
  daysSinceLastWithdrawal: number | null;
}

/**
 * Calculate withdrawal fee for a given amount
 *
 * Fees are calculated based on:
 * - User's current MLM rank (base fee)
 * - Number of withdrawals in current month (progressive fee)
 * - Days since last withdrawal (loyalty discount)
 */
export async function calculateWithdrawalFee({
  userId,
  amount,
}: CalculateWithdrawalFeeRequest): Promise<CalculateWithdrawalFeeResponse> {
  // 1. Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentRank: true,
      lastWithdrawalAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 2. Calculate withdrawal count in current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const withdrawalCount = await prisma.withdrawal.count({
    where: {
      userId,
      createdAt: { gte: firstDayOfMonth },
      status: { notIn: ["REJECTED", "FAILED"] }, // Only count successful/pending withdrawals
    },
  });

  // 3. Calculate days since last withdrawal
  let daysSinceLastWithdrawal: number | null = null;
  let loyaltyTier: LoyaltyTier = "NORMAL";

  if (user.lastWithdrawalAt) {
    const diffMs = now.getTime() - user.lastWithdrawalAt.getTime();
    daysSinceLastWithdrawal = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    loyaltyTier = calculateLoyaltyTier(daysSinceLastWithdrawal);
  }

  // 4. Calculate fee using MLM config
  const feeBreakdown = calculateFeeFromConfig(
    user.currentRank,
    withdrawalCount,
    loyaltyTier
  );

  // 5. Calculate amounts
  const totalFeeAmount = (amount * feeBreakdown.totalFee) / 100;
  const netAmount = amount - totalFeeAmount;

  return {
    amount,
    baseFee: feeBreakdown.baseFee,
    progressiveFee: feeBreakdown.progressiveFee,
    loyaltyDiscount: feeBreakdown.loyaltyDiscount,
    totalFeePercentage: feeBreakdown.totalFee,
    totalFeeAmount,
    netAmount,
    rank: user.currentRank,
    withdrawalCount,
    loyaltyTier,
    daysSinceLastWithdrawal,
  };
}
