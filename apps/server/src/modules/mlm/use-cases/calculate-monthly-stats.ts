/**
 * Calculate Monthly Stats Use Case
 *
 * Calculates and saves monthly statistics for a user.
 * Used by the monthly cron job to track rank maintenance requirements.
 */

import { prisma } from "@/lib/prisma";
import { MLMRank } from "@prisma/client";
import {
  getActiveDirects,
  calculateNetworkVolume,
} from "@/modules/mlm/helpers/network";
import { getRankRequirements } from "@/modules/mlm/mlm-config";

export interface MonthlyStatsInput {
  userId: string;
  month: number; // 1-12
  year: number; // 2025, 2026...
}

export interface MonthlyStatsResult {
  id: string;
  userId: string;
  month: number;
  year: number;
  activeDirects: number;
  totalVolume: number;
  metRequirements: boolean;
  rankAtStart: MLMRank;
}

/**
 * Calculate monthly statistics for a user
 *
 * This function:
 * 1. Gets user's current rank
 * 2. Calculates active directs in the month
 * 3. Calculates total network volume in the month
 * 4. Checks if user met maintenance requirements
 * 5. Saves stats to database
 */
export async function calculateMonthlyStats({
  userId,
  month,
  year,
}: MonthlyStatsInput): Promise<MonthlyStatsResult> {
  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentRank: true,
      blockedBalance: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get rank requirements
  const rankConfig = getRankRequirements(user.currentRank);

  // Define month range
  const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in Date
  const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month

  // Calculate stats for the month
  const totalVolume = await calculateNetworkVolume(userId, startDate, endDate);

  // For active directs, we need to check at the time of the month
  // This is tricky because getActiveDirects uses "last 30 days from now"
  // For historical months, we'd need different logic
  // For simplicity, we'll calculate it at month end
  const activeDirectsCount = await getActiveDirects(userId);

  const totalVolumeNum = parseFloat(totalVolume.toString());
  const blockedBalanceNum = parseFloat(user.blockedBalance.toString());

  // Check if user met requirements
  const activeDirectsMet = activeDirectsCount >= rankConfig.minActiveDirects;
  const monthlyVolumeMet = totalVolumeNum >= rankConfig.minMonthlyVolume;
  const blockedBalanceMet = blockedBalanceNum >= rankConfig.minBlockedBalance;

  const metRequirements =
    activeDirectsMet && monthlyVolumeMet && blockedBalanceMet;

  // Save or update stats
  const stats = await prisma.monthlyStats.upsert({
    where: {
      userId_year_month: {
        userId,
        year,
        month,
      },
    },
    create: {
      userId,
      month,
      year,
      activeDirects: activeDirectsCount,
      totalVolume: totalVolumeNum,
      metRequirements,
      rankAtStart: user.currentRank,
    },
    update: {
      activeDirects: activeDirectsCount,
      totalVolume: totalVolumeNum,
      metRequirements,
    },
  });

  return {
    id: stats.id,
    userId: stats.userId,
    month: stats.month,
    year: stats.year,
    activeDirects: stats.activeDirects,
    totalVolume: parseFloat(stats.totalVolume.toString()),
    metRequirements: stats.metRequirements,
    rankAtStart: stats.rankAtStart,
  };
}

/**
 * Calculate stats for last month (helper for cron job)
 */
export async function calculateLastMonthStats(
  userId: string
): Promise<MonthlyStatsResult> {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  return calculateMonthlyStats({
    userId,
    month: lastMonth.getMonth() + 1, // getMonth() is 0-indexed
    year: lastMonth.getFullYear(),
  });
}

/**
 * Get monthly stats for a user
 */
export async function getMonthlyStats(
  userId: string,
  month: number,
  year: number
) {
  const stats = await prisma.monthlyStats.findUnique({
    where: {
      userId_year_month: {
        userId,
        year,
        month,
      },
    },
  });

  if (!stats) {
    return null;
  }

  return {
    id: stats.id,
    userId: stats.userId,
    month: stats.month,
    year: stats.year,
    activeDirects: stats.activeDirects,
    totalVolume: parseFloat(stats.totalVolume.toString()),
    metRequirements: stats.metRequirements,
    rankAtStart: stats.rankAtStart,
    createdAt: stats.createdAt,
  };
}

/**
 * Get all monthly stats for a user (for dashboard history)
 */
export async function getUserMonthlyHistory(userId: string, limit = 12) {
  const stats = await prisma.monthlyStats.findMany({
    where: { userId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: limit,
  });

  return stats.map((s) => ({
    id: s.id,
    month: s.month,
    year: s.year,
    activeDirects: s.activeDirects,
    totalVolume: parseFloat(s.totalVolume.toString()),
    metRequirements: s.metRequirements,
    rankAtStart: s.rankAtStart,
    createdAt: s.createdAt,
  }));
}
