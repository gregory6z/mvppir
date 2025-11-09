/**
 * MLM Network Helpers
 *
 * Utility functions for navigating and analyzing the MLM network structure.
 */

import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { getUserTotalBalance } from "./balance";

export interface NetworkUser {
  id: string;
  name: string;
  email: string;
  currentRank: string;
  status: string;
  totalBalance: Decimal;
  createdAt: Date;
}

export interface NetworkLevels {
  N1: NetworkUser[];
  N2: NetworkUser[];
  N3: NetworkUser[];
}

export interface NetworkStats {
  N1: {
    count: number;
    totalBalance: Decimal;
  };
  N2: {
    count: number;
    totalBalance: Decimal;
  };
  N3: {
    count: number;
    totalBalance: Decimal;
  };
  totalNetworkSize: number;
  totalNetworkBalance: Decimal;
}

/**
 * Fetch network levels for a user (N1, N2, N3)
 */
export async function getNetworkLevels(
  userId: string
): Promise<NetworkLevels> {
  // N1: Direct referrals of user
  const N1Users = await prisma.user.findMany({
    where: {
      referrerId: userId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      currentRank: true,
      status: true,
      createdAt: true,
    },
  });

  const N1WithBalances = await Promise.all(
    N1Users.map(async (user) => ({
      ...user,
      totalBalance: await getUserTotalBalance(user.id),
    }))
  );

  // N2: Direct referrals of N1 users
  const N1Ids = N1Users.map((u) => u.id);

  const N2Users =
    N1Ids.length > 0
      ? await prisma.user.findMany({
          where: {
            referrerId: { in: N1Ids },
            status: "ACTIVE",
          },
          select: {
            id: true,
            name: true,
            email: true,
            currentRank: true,
            status: true,
            createdAt: true,
          },
        })
      : [];

  const N2WithBalances = await Promise.all(
    N2Users.map(async (user) => ({
      ...user,
      totalBalance: await getUserTotalBalance(user.id),
    }))
  );

  // N3: Direct referrals of N2 users
  const N2Ids = N2Users.map((u) => u.id);

  const N3Users =
    N2Ids.length > 0
      ? await prisma.user.findMany({
          where: {
            referrerId: { in: N2Ids },
            status: "ACTIVE",
          },
          select: {
            id: true,
            name: true,
            email: true,
            currentRank: true,
            status: true,
            createdAt: true,
          },
        })
      : [];

  const N3WithBalances = await Promise.all(
    N3Users.map(async (user) => ({
      ...user,
      totalBalance: await getUserTotalBalance(user.id),
    }))
  );

  return {
    N1: N1WithBalances,
    N2: N2WithBalances,
    N3: N3WithBalances,
  };
}

/**
 * Get network statistics (aggregated data)
 */
export async function getNetworkStats(userId: string): Promise<NetworkStats> {
  const levels = await getNetworkLevels(userId);

  const N1Total = levels.N1.reduce(
    (sum, user) => sum.add(user.totalBalance),
    new Decimal(0)
  );

  const N2Total = levels.N2.reduce(
    (sum, user) => sum.add(user.totalBalance),
    new Decimal(0)
  );

  const N3Total = levels.N3.reduce(
    (sum, user) => sum.add(user.totalBalance),
    new Decimal(0)
  );

  return {
    N1: {
      count: levels.N1.length,
      totalBalance: N1Total,
    },
    N2: {
      count: levels.N2.length,
      totalBalance: N2Total,
    },
    N3: {
      count: levels.N3.length,
      totalBalance: N3Total,
    },
    totalNetworkSize: levels.N1.length + levels.N2.length + levels.N3.length,
    totalNetworkBalance: N1Total.add(N2Total).add(N3Total),
  };
}

/**
 * Get active directs (for monthly maintenance check)
 *
 * Active direct = N1 user with:
 * - Status = ACTIVE
 * - Blocked balance >= $100 (invested amount)
 */
export async function getActiveDirects(userId: string): Promise<number> {
  const activeDirects = await prisma.user.findMany({
    where: {
      referrerId: userId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      blockedBalance: true,
    },
  });

  // Filter by blockedBalance >= $100
  const activeWithBalance = activeDirects.filter((user) => {
    return user.blockedBalance.gte(100);
  });

  return activeWithBalance.length;
}

/**
 * Calculate total network volume (all deposits from user + N1+N2+N3)
 *
 * Used for lifetime volume (never decreases) and monthly volume (resets monthly).
 * Includes the user's own deposits + network deposits.
 */
export async function calculateNetworkVolume(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Decimal> {
  const levels = await getNetworkLevels(userId);

  // Get all user IDs in network (including the user themselves)
  const allNetworkUserIds = [
    userId, // Include the user's own deposits
    ...levels.N1.map((u) => u.id),
    ...levels.N2.map((u) => u.id),
    ...levels.N3.map((u) => u.id),
  ];

  // Sum all confirmed deposits from network
  // Ignora depósitos de teste (apenas dinheiro real conta para volume MLM)
  const whereClause: any = {
    userId: { in: allNetworkUserIds },
    status: "CONFIRMED",
    type: "CREDIT",
    isTest: false, // 🔑 Ignora depósitos de teste
  };

  // Add date range if provided (for monthly volume)
  if (startDate) {
    whereClause.createdAt = { gte: startDate };
  }
  if (endDate) {
    whereClause.createdAt = { ...whereClause.createdAt, lte: endDate };
  }

  const transactions = await prisma.walletTransaction.findMany({
    where: whereClause,
    select: {
      amount: true,
    },
  });

  return transactions.reduce((sum, tx) => sum.add(tx.amount), new Decimal(0));
}
