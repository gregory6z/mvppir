/**
 * Block Balance Use Case
 *
 * Transfers USDC from availableBalance to blockedBalance to meet rank requirements.
 *
 * Business Rules:
 * 1. Only USDC can be blocked
 * 2. User must have sufficient availableBalance
 * 3. Amount must be > 0
 * 4. Operation is atomic (Balance and User updated together)
 */

import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

interface BlockBalanceRequest {
  userId: string;
  amount: number; // Amount in USDC to block
}

interface BlockBalanceResponse {
  success: boolean;
  blockedBalance: number; // Total blocked balance after operation
  availableBalance: number; // Remaining available balance
  message: string;
}

export async function blockBalance({
  userId,
  amount,
}: BlockBalanceRequest): Promise<BlockBalanceResponse> {
  // Validate amount
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  const amountDecimal = new Decimal(amount);

  // Execute atomic transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Get user's current blocked balance
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { blockedBalance: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // 2. Get USDC balance
    const balance = await tx.balance.findUnique({
      where: {
        userId_tokenSymbol: {
          userId,
          tokenSymbol: "USDC",
        },
      },
      select: {
        availableBalance: true,
      },
    });

    if (!balance) {
      throw new Error("USDC balance not found. Please deposit USDC first.");
    }

    // 3. Check if user has enough available balance
    if (balance.availableBalance.lt(amountDecimal)) {
      throw new Error(
        `Insufficient available balance. You have $${balance.availableBalance.toString()} USDC available, but trying to block $${amount}.`
      );
    }

    // 4. Update Balance: decrease availableBalance
    const updatedBalance = await tx.balance.update({
      where: {
        userId_tokenSymbol: {
          userId,
          tokenSymbol: "USDC",
        },
      },
      data: {
        availableBalance: {
          decrement: amountDecimal,
        },
      },
      select: {
        availableBalance: true,
      },
    });

    // 5. Update User: increase blockedBalance
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        blockedBalance: {
          increment: amountDecimal,
        },
      },
      select: {
        blockedBalance: true,
      },
    });

    return {
      blockedBalance: updatedUser.blockedBalance,
      availableBalance: updatedBalance.availableBalance,
    };
  });

  return {
    success: true,
    blockedBalance: parseFloat(result.blockedBalance.toString()),
    availableBalance: parseFloat(result.availableBalance.toString()),
    message: `Successfully blocked $${amount} USDC. Your blocked balance is now $${parseFloat(result.blockedBalance.toString())}.`,
  };
}
