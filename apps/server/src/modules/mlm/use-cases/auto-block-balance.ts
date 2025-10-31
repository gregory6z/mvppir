/**
 * Auto-Block Balance Use Case
 *
 * Automatically blocks USDC/USDT balance to upgrade user's rank after deposit confirmation.
 *
 * Business Rules:
 * 1. Only triggered after CONFIRMED deposit (USDC or USDT)
 * 2. Blocks MINIMUM amount needed for highest achievable rank
 * 3. Leaves extra balance available for withdrawal
 * 4. Updates user's rank automatically
 * 5. Operation is atomic (Balance, User updated together)
 * 6. Combines USDC + USDT balances for rank calculation
 *
 * Example:
 *   User deposits $700 USDC with 3 directs
 *   - BRONZE requires: 3 directs + $500 blocked ✅
 *   - SILVER requires: 5 directs + $2,000 blocked ❌ (only has 3 directs)
 *   - System blocks $500 (Bronze)
 *   - Leaves $200 available
 *   - Upgrades rank: RECRUIT → BRONZE
 */

import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"
import { MLMRank } from "@prisma/client"
import { getRankRequirements } from "../mlm-config"

interface AutoBlockBalanceRequest {
  userId: string
}

interface AutoBlockBalanceResponse {
  blocked: boolean
  amountBlocked: number
  previousRank: MLMRank
  newRank: MLMRank
  blockedBalance: number
  availableBalance: number
}

/**
 * Calculate highest achievable rank based on ALL conquest requirements
 */
async function calculateAchievableRank(
  userId: string,
  availableBalance: Decimal,
  tx: any
): Promise<{
  rank: MLMRank
  requiredBlocked: number
}> {
  // Get user's conquest stats
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
    },
  })

  if (!user) {
    return { rank: "RECRUIT", requiredBlocked: 100 }
  }

  // Count ACTIVE directs only (users who deposited at least $100)
  const activeDirectsCount = await tx.user.count({
    where: {
      referrerId: userId,
      status: "ACTIVE", // Only count activated accounts
    },
  })

  const ranks: MLMRank[] = ["GOLD", "SILVER", "BRONZE", "RECRUIT"]

  for (const rank of ranks) {
    const config = getRankRequirements(rank)

    // Check conquest requirements (ACTIVE directs + blocked balance only)
    const hasEnoughDirects = activeDirectsCount >= config.minDirects
    const hasEnoughBalance = availableBalance.gte(config.minBlockedBalance)

    // Both requirements must be met
    if (hasEnoughDirects && hasEnoughBalance) {
      return { rank, requiredBlocked: config.minBlockedBalance }
    }
  }

  return { rank: "RECRUIT", requiredBlocked: 100 }
}

export async function autoBlockBalance({
  userId,
}: AutoBlockBalanceRequest): Promise<AutoBlockBalanceResponse> {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Get user's current rank and blocked balance
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        currentRank: true,
        blockedBalance: true,
      },
    })

    if (!user) {
      throw new Error("User not found")
    }

    // 2. Get USDC + USDT available balances
    const balances = await tx.balance.findMany({
      where: {
        userId,
        tokenSymbol: { in: ["USDC", "USDT"] },
      },
      select: {
        tokenSymbol: true,
        availableBalance: true,
      },
    })

    // Sum USDC + USDT available balances
    const totalAvailable = balances.reduce((sum, bal) => {
      return sum.add(bal.availableBalance)
    }, new Decimal(0))

    if (totalAvailable.lte(0)) {
      // No available balance to block
      return {
        blocked: false,
        amountBlocked: 0,
        previousRank: user.currentRank,
        newRank: user.currentRank,
        blockedBalance: parseFloat(user.blockedBalance.toString()),
        availableBalance: 0,
      }
    }

    // 3. Calculate total balance (available USDC+USDT + already blocked)
    const totalBalance = totalAvailable.add(user.blockedBalance)

    // 4. Calculate highest achievable rank (checks ALL conquest requirements)
    const { rank: achievableRank, requiredBlocked } = await calculateAchievableRank(
      userId,
      totalBalance,
      tx
    )

    // 5. Check if already at achievable rank
    if (user.currentRank === achievableRank) {
      return {
        blocked: false,
        amountBlocked: 0,
        previousRank: user.currentRank,
        newRank: user.currentRank,
        blockedBalance: parseFloat(user.blockedBalance.toString()),
        availableBalance: parseFloat(totalAvailable.toString()),
      }
    }

    // 6. Calculate how much MORE to block
    const alreadyBlocked = user.blockedBalance.toNumber()
    const needToBlock = requiredBlocked - alreadyBlocked

    if (needToBlock <= 0) {
      // Already has enough blocked
      return {
        blocked: false,
        amountBlocked: 0,
        previousRank: user.currentRank,
        newRank: user.currentRank,
        blockedBalance: parseFloat(user.blockedBalance.toString()),
        availableBalance: parseFloat(totalAvailable.toString()),
      }
    }

    const amountToBlock = new Decimal(needToBlock)

    // 7. Update Balance: decrease availableBalance (prioritize USDC, then USDT)
    let remainingToBlock = amountToBlock
    let finalAvailableBalance = new Decimal(0)

    // Sort balances: USDC first, then USDT
    const sortedBalances = balances.sort((a, b) => {
      if (a.tokenSymbol === "USDC") return -1
      if (b.tokenSymbol === "USDC") return 1
      return 0
    })

    for (const bal of sortedBalances) {
      if (remainingToBlock.lte(0)) break

      const availableInToken = bal.availableBalance
      const toDeductFromToken = Decimal.min(remainingToBlock, availableInToken)

      if (toDeductFromToken.gt(0)) {
        const updated = await tx.balance.update({
          where: {
            userId_tokenSymbol: {
              userId,
              tokenSymbol: bal.tokenSymbol,
            },
          },
          data: {
            availableBalance: {
              decrement: toDeductFromToken,
            },
          },
          select: {
            availableBalance: true,
          },
        })

        remainingToBlock = remainingToBlock.sub(toDeductFromToken)
        finalAvailableBalance = finalAvailableBalance.add(updated.availableBalance)
      }
    }

    // 8. Update User: increase blockedBalance and upgrade rank
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        blockedBalance: {
          increment: amountToBlock,
        },
        currentRank: achievableRank,
        rankConqueredAt: new Date(), // Mark when rank was achieved
        rankStatus: "ACTIVE", // Reset to ACTIVE when upgrading
        warningCount: 0, // Reset warnings on upgrade
        originalRank: null, // Clear any downrank tracking
        gracePeriodEndsAt: null,
      },
      select: {
        blockedBalance: true,
      },
    })

    return {
      blocked: true,
      amountBlocked: needToBlock,
      previousRank: user.currentRank,
      newRank: achievableRank,
      blockedBalance: parseFloat(updatedUser.blockedBalance.toString()),
      availableBalance: parseFloat(finalAvailableBalance.toString()),
    }
  })

  return result
}
