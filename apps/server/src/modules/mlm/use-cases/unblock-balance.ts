/**
 * Unblock Balance Use Case
 *
 * Transfers USDC from blockedBalance back to availableBalance.
 * Used when user wants to withdraw more than available balance.
 *
 * Business Rules:
 * 1. Only USDC can be unblocked
 * 2. User must have sufficient blockedBalance
 * 3. Amount must be > 0
 * 4. May cause rank downgrade if blockedBalance falls below requirement
 * 5. Operation is atomic (Balance and User updated together)
 */

import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"
import { MLMRank } from "@prisma/client"
import { getRankRequirements } from "../mlm-config"
import { updateUserBlockedBalance } from "../helpers/update-blocked-balance"

interface UnblockBalanceRequest {
  userId: string
  amount: number // Amount in USDC to unblock
}

interface UnblockBalanceResponse {
  success: boolean
  amountUnblocked: number
  blockedBalance: number
  availableBalance: number
  previousRank: MLMRank
  newRank: MLMRank
  rankChanged: boolean
  message: string
}

/**
 * Calculate new rank based on blocked balance
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

export async function unblockBalance({
  userId,
  amount,
}: UnblockBalanceRequest): Promise<UnblockBalanceResponse> {
  // Validate amount
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0")
  }

  const amountDecimal = new Decimal(amount)

  // Execute atomic transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Get user's current data
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        blockedBalance: true,
        currentRank: true,
      },
    })

    if (!user) {
      throw new Error("User not found")
    }

    // 2. Check if user has enough blocked balance
    if (user.blockedBalance.lt(amountDecimal)) {
      throw new Error(
        `Insufficient blocked balance. You have $${user.blockedBalance.toString()} USDC blocked, but trying to unblock $${amount}.`
      )
    }

    // 3. Calculate expected new blocked balance (for rank calculation)
    const expectedBlockedBalance = user.blockedBalance.sub(amountDecimal)
    const expectedBlockedBalanceNumber = parseFloat(expectedBlockedBalance.toString())

    // 4. Calculate new rank based on expected blocked balance
    const newRank = calculateRankFromBlockedBalance(expectedBlockedBalanceNumber)
    const rankChanged = newRank !== user.currentRank

    // 5. Update Balance: increase availableBalance (or create if doesn't exist)
    const updatedBalance = await tx.balance.upsert({
      where: {
        userId_tokenSymbol: {
          userId,
          tokenSymbol: "USDC",
        },
      },
      create: {
        userId,
        tokenSymbol: "USDC",
        tokenAddress: null,
        availableBalance: amountDecimal,
        lockedBalance: 0,
      },
      update: {
        availableBalance: {
          increment: amountDecimal,
        },
      },
      select: {
        availableBalance: true,
      },
    })

    // 6. Update User.blockedBalance automatically based on available USDC + USDT
    const newBlockedBalance = await updateUserBlockedBalance(userId, tx)

    // 7. Update rank if needed based on new blocked balance
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        ...(rankChanged && {
          currentRank: newRank,
          rankStatus: "ACTIVE", // Reset to ACTIVE on manual change
          warningCount: 0,
          originalRank: null,
          gracePeriodEndsAt: null,
        }),
      },
      select: {
        blockedBalance: true,
        currentRank: true,
      },
    })

    return {
      blockedBalance: newBlockedBalance,
      availableBalance: updatedBalance.availableBalance,
      previousRank: user.currentRank,
      newRank: updatedUser.currentRank,
    }
  })

  // Generate message
  let message = `Successfully unblocked $${amount} USDC.`

  if (result.newRank !== result.previousRank) {
    message += ` Your rank changed from ${result.previousRank} to ${result.newRank}.`
  }

  return {
    success: true,
    amountUnblocked: amount,
    blockedBalance: parseFloat(result.blockedBalance.toString()),
    availableBalance: parseFloat(result.availableBalance.toString()),
    previousRank: result.previousRank,
    newRank: result.newRank,
    rankChanged: result.newRank !== result.previousRank,
    message,
  }
}
