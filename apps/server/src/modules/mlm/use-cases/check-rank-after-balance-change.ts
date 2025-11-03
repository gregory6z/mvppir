/**
 * Check Rank After Balance Change Use Case
 *
 * Verifies if user's rank needs to be downgraded after balance changes
 * (withdrawals, unblocking, etc.)
 *
 * This is called AFTER balance changes are committed to ensure rank
 * matches the current blockedBalance.
 */

import { prisma } from "@/lib/prisma"
import { MLMRank } from "@prisma/client"
import { getRankRequirements } from "../mlm-config"

interface CheckRankAfterBalanceChangeRequest {
  userId: string
}

interface CheckRankAfterBalanceChangeResponse {
  rankChanged: boolean
  previousRank: MLMRank
  newRank: MLMRank
  reason?: string
}

/**
 * Calculate appropriate rank based on blocked balance
 */
function calculateRankFromBlockedBalance(blockedBalance: number): MLMRank {
  const ranks: MLMRank[] = ["GOLD", "SILVER", "BRONZE", "RECRUIT"]

  for (const rank of ranks) {
    const config = getRankRequirements(rank)
    if (blockedBalance >= config.minBlockedBalance) {
      return rank
    }
  }

  return "RECRUIT"
}

/**
 * Check and update user's rank based on current blockedBalance
 * 
 * Should be called after:
 * - Withdrawal completion (USDC balance decreased)
 * - Balance unblock (blockedBalance → availableBalance)
 * - Any operation that modifies blockedBalance
 */
export async function checkRankAfterBalanceChange({
  userId,
}: CheckRankAfterBalanceChangeRequest): Promise<CheckRankAfterBalanceChangeResponse> {
  // Get user's current data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      blockedBalance: true,
      currentRank: true,
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  const blockedBalanceNumber = parseFloat(user.blockedBalance.toString())
  const newRank = calculateRankFromBlockedBalance(blockedBalanceNumber)
  const rankChanged = newRank !== user.currentRank

  if (!rankChanged) {
    return {
      rankChanged: false,
      previousRank: user.currentRank,
      newRank: user.currentRank,
    }
  }

  // Rank needs to be downgraded
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentRank: newRank,
      rankStatus: "DOWNRANKED",
      rankConqueredAt: new Date(), // Reset conquest date
      warningCount: 0,
      originalRank: null,
      gracePeriodEndsAt: null,
    },
  })

  console.log(
    `⬇️  User ${user.email} downgraded from ${user.currentRank} to ${newRank} due to insufficient blocked balance ($${blockedBalanceNumber})`
  )

  return {
    rankChanged: true,
    previousRank: user.currentRank,
    newRank,
    reason: `Blocked balance ($${blockedBalanceNumber}) below requirement for ${user.currentRank}`,
  }
}
