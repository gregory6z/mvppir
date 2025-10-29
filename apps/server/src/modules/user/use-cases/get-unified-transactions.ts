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
  // Get total count first (optimized - no data fetching)
  const [walletCount, commissionCount] = await Promise.all([
    prisma.walletTransaction.count({ where: { userId } }),
    prisma.commission.count({ where: { userId } }),
  ]);

  const totalCount = walletCount + commissionCount;

  // Fetch both wallet transactions and commissions with orderBy
  // We fetch more than needed to properly merge and paginate
  const fetchLimit = Math.min(limit * 3, 200); // Fetch extra for merging, but cap at 200

  const [walletTransactions, commissions] = await Promise.all([
    prisma.walletTransaction.findMany({
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
      orderBy: { createdAt: "desc" },
      take: fetchLimit,
    }),
    prisma.commission.findMany({
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
      orderBy: { createdAt: "desc" },
      take: fetchLimit,
    }),
  ]);

  // Get unique fromUserIds only from fetched commissions
  const fromUserIds = [
    ...new Set(
      commissions
        .filter((c) => c.fromUserId !== userId) // Exclude self-commissions
        .map((c) => c.fromUserId)
    ),
  ];

  // Fetch user names only for the commissions we actually fetched
  const fromUsers =
    fromUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: fromUserIds } },
          select: { id: true, name: true },
        })
      : [];

  const fromUserMap = new Map(fromUsers.map((u) => [u.id, u.name]));

  // Convert wallet transactions to unified format
  // Only calculate USD for the transactions we'll actually return
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

  // Convert commissions to unified format (no async needed)
  const unifiedCommissions: UnifiedTransaction[] = commissions.map((comm) => {
    const isSelfCommission = comm.level === 0;

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
      commissionLevel: comm.level,
      fromUserName: isSelfCommission ? undefined : fromUserMap.get(comm.fromUserId),
      userRank: undefined, // TODO: Add rank tracking
    };
  });

  // Merge and sort by date (newest first)
  const allTransactions = [...unifiedWalletTxs, ...unifiedCommissions].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  // Apply pagination after merge
  const paginatedTransactions = allTransactions.slice(offset, offset + limit);

  return {
    transactions: paginatedTransactions,
    pagination: {
      total: totalCount,
      limit,
      offset,
      hasMore: offset + limit < totalCount,
    },
  };
}
