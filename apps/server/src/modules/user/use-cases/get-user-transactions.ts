import { prisma } from "@/lib/prisma";

interface GetUserTransactionsRequest {
  userId: string;
  limit?: number;
  offset?: number;
}

export async function getUserTransactions({
  userId,
  limit = 50,
  offset = 0,
}: GetUserTransactionsRequest) {
  const transactions = await prisma.walletTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
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

  const total = await prisma.walletTransaction.count({
    where: { userId },
  });

  return {
    transactions,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
}
