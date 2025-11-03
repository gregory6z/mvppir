import { prisma } from "@/lib/prisma";
import { getRankRequirements } from "@/modules/mlm/mlm-config";

interface GetWithdrawalLimitsRequest {
  userId: string;
}

interface GetWithdrawalLimitsResponse {
  canWithdraw: boolean;
  dailyLimit: number; // Limite diário baseado no rank
  withdrawnToday: number; // Quanto já foi sacado hoje
  remainingToday: number; // Quanto ainda pode sacar hoje
  totalBalance: number; // Saldo total (available + locked)
  minBalanceRequired: number; // $500 mínimo
  hasMinBalance: boolean; // Se tem os $500 mínimos
  hasPendingWithdrawal: boolean; // Se já tem saque pendente
  errors: string[]; // Lista de erros que impedem saque
  warnings: string[]; // Lista de avisos importantes
}

const MIN_BALANCE_TO_WITHDRAW = Number(process.env.MIN_BALANCE_TO_WITHDRAW) || 500;

/**
 * Get withdrawal limits and validation for user
 *
 * Returns all necessary information to validate withdrawal eligibility:
 * - Daily limit based on rank
 * - Amount already withdrawn today
 * - Remaining daily limit
 * - Balance validations
 * - Pending withdrawal status
 */
export async function getWithdrawalLimits({
  userId,
}: GetWithdrawalLimitsRequest): Promise<GetWithdrawalLimitsResponse> {
  // 1. Get user's current rank
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentRank: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 2. Get daily limit from rank config
  const rankConfig = getRankRequirements(user.currentRank);
  const dailyLimit = rankConfig.withdrawalFee.dailyLimit;

  // 3. Calculate total withdrawn today
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const withdrawalsToday = await prisma.withdrawal.findMany({
    where: {
      userId,
      createdAt: { gte: startOfDay },
      status: { notIn: ["REJECTED", "FAILED"] }, // Only count successful/pending withdrawals
    },
    select: {
      amount: true,
    },
  });

  const withdrawnToday = withdrawalsToday.reduce(
    (sum, w) => sum + w.amount.toNumber(),
    0
  );

  // 4. Calculate remaining daily limit
  const remainingToday = Math.max(0, dailyLimit - withdrawnToday);

  // 5. Get user's total balance
  const balance = await prisma.balance.findUnique({
    where: {
      userId_tokenSymbol: { userId, tokenSymbol: "USDC" },
    },
    select: {
      availableBalance: true,
      lockedBalance: true,
    },
  });

  const totalBalance = balance
    ? balance.availableBalance.add(balance.lockedBalance).toNumber()
    : 0;

  // 6. Check if has minimum balance
  const hasMinBalance = totalBalance >= MIN_BALANCE_TO_WITHDRAW;

  // 7. Check if has pending withdrawal
  const pendingWithdrawal = await prisma.withdrawal.findFirst({
    where: {
      userId,
      status: { in: ["PENDING_APPROVAL", "APPROVED", "PROCESSING"] },
    },
  });

  const hasPendingWithdrawal = !!pendingWithdrawal;

  // 8. Build errors list (blocking issues)
  const errors: string[] = [];

  if (!hasMinBalance) {
    errors.push(
      `Insufficient balance. You need at least $${MIN_BALANCE_TO_WITHDRAW} to make a withdrawal.`
    );
  }

  if (hasPendingWithdrawal) {
    errors.push(
      "You already have a pending withdrawal. Please wait for approval before requesting a new one."
    );
  }

  if (remainingToday <= 0) {
    errors.push(
      `Daily limit reached. You can withdraw up to $${dailyLimit} per day. Try again tomorrow.`
    );
  }

  // 9. Build warnings list (important info)
  const warnings: string[] = [];

  if (remainingToday < dailyLimit && remainingToday > 0) {
    warnings.push(
      `You have already withdrawn $${withdrawnToday.toFixed(2)} today. Remaining: $${remainingToday.toFixed(2)}`
    );
  }

  // 10. Determine if can withdraw
  const canWithdraw = errors.length === 0;

  return {
    canWithdraw,
    dailyLimit,
    withdrawnToday,
    remainingToday,
    totalBalance,
    minBalanceRequired: MIN_BALANCE_TO_WITHDRAW,
    hasMinBalance,
    hasPendingWithdrawal,
    errors,
    warnings,
  };
}
