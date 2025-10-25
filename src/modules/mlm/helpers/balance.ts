/**
 * MLM Balance Helpers
 *
 * Utility functions for calculating user balances in the MLM system.
 */

import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Get total balance for a user (sum of all tokens)
 */
export async function getUserTotalBalance(userId: string): Promise<Decimal> {
  const balances = await prisma.balance.findMany({
    where: { userId },
    select: { availableBalance: true },
  });

  return balances.reduce(
    (sum, b) => sum.add(b.availableBalance),
    new Decimal(0)
  );
}
