import { prisma } from "@/lib/prisma";
import { calculateTotalUSD } from "@/providers/price/price.provider";

interface GetUnifiedTransactionsRequest {
  userId: string;
  limit?: number;
  offset?: number;
}

// Unified transaction that includes both wallet transactions and commissions
export interface UnifiedTransaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "COMMISSION";
  tokenSymbol: string;
  tokenAddress: string | null;
  amount: string; // Human readable amount
  usdValue: number; // Amount in USD
  txHash: string | null;
  transferTxHash: string | null;
  status: string;
  createdAt: Date;

  // Commission specific fields
  commissionLevel?: number; // 0 = self (daily yield), 1-3 = network levels
  fromUserName?: string; // Name of user who generated the commission
  userRank?: string; // Rank of user at time of commission
}

export async function getUnifiedTransactions({
  userId,
  limit = 50,
  offset = 0,
}: GetUnifiedTransactionsRequest) {
  // Get wallet transactions (deposits/withdrawals)
  const walletTransactions = await prisma.walletTransaction.findMany({
    where: { userId },
    select: {
      id: true,
      type: true,
      tokenSymbol: true,
      tokenAddress: true,
      amount: true,
      txHash: true,
      transferTxHash: true,
      status: true,
      createdAt: true,
    },
  });

  // Get commissions (all levels including self - level 0)
  const commissions = await prisma.commission.findMany({
    where: { userId },
    select: {
      id: true,
      finalAmount: true,
      level: true,
      fromUserId: true,
      status: true,
      createdAt: true,
      referenceDate: true,
    },
  });

  // Get names for fromUserIds
  const fromUserIds = commissions
    .filter((c) => c.fromUserId !== userId) // Exclude self-commissions
    .map((c) => c.fromUserId);

  const fromUsers = await prisma.user.findMany({
    where: { id: { in: fromUserIds } },
    select: { id: true, name: true },
  });

  const fromUserMap = new Map(fromUsers.map((u) => [u.id, u.name]));

  // Convert wallet transactions to unified format
  const unifiedWalletTxs: UnifiedTransaction[] = await Promise.all(
    walletTransactions.map(async (tx) => {
      const usdValue = await calculateTotalUSD({
        [tx.tokenSymbol]: tx.amount.toNumber(),
      });

      return {
        id: tx.id,
        type: tx.type === "CREDIT" ? ("DEPOSIT" as const) : ("WITHDRAWAL" as const),
        tokenSymbol: tx.tokenSymbol,
        tokenAddress: tx.tokenAddress,
        amount: tx.amount.toString(),
        usdValue,
        txHash: tx.txHash,
        transferTxHash: tx.transferTxHash,
        status: tx.status,
        createdAt: tx.createdAt,
      };
    })
  );

  // Convert commissions to unified format
  const unifiedCommissions: UnifiedTransaction[] = commissions.map((comm) => {
    const isSelfCommission = comm.fromUserId === userId;

    return {
      id: comm.id,
      type: "COMMISSION" as const,
      tokenSymbol: "USD", // Commissions are always in USD
      tokenAddress: null,
      amount: comm.finalAmount.toString(),
      usdValue: comm.finalAmount.toNumber(),
      txHash: null,
      transferTxHash: null,
      status: comm.status,
      createdAt: comm.createdAt,
      // Commission level indicates network depth:
      // 0 = Self (daily yield from own balance)
      // 1 = Direct referral (filho - N1)
      // 2 = Second level (neto - N2)
      // 3 = Third level (bisneto - N3)
      commissionLevel: isSelfCommission ? 0 : comm.level,
      fromUserName: isSelfCommission ? undefined : fromUserMap.get(comm.fromUserId),
      userRank: undefined, // TODO: Add rank tracking
    };
  });

  // Merge and sort by date (newest first)
  const allTransactions = [...unifiedWalletTxs, ...unifiedCommissions].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  // Apply pagination
  const paginatedTransactions = allTransactions.slice(offset, offset + limit);

  return {
    transactions: paginatedTransactions,
    pagination: {
      total: allTransactions.length,
      limit,
      offset,
      hasMore: offset + limit < allTransactions.length,
    },
  };
}
