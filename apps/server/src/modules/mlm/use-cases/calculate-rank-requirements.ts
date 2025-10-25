/**
 * Calculate Rank Requirements Use Case
 *
 * Verifies if a user meets the requirements for a specific rank.
 * Handles both conquest (lifetime) and maintenance (monthly) requirements.
 */

import { prisma } from "@/lib/prisma";
import { getRankRequirements } from "@/modules/mlm/mlm-config";
import { MLMRank } from "@prisma/client";
import {
  getActiveDirects,
  calculateNetworkVolume,
} from "@/modules/mlm/helpers/network";

export interface RankRequirementsCheck {
  rank: MLMRank;
  meetsRequirements: boolean;

  conquest: {
    directs: {
      required: number;
      actual: number;
      met: boolean;
    };
    lifetimeVolume: {
      required: number;
      actual: number;
      met: boolean;
    };
    blockedBalance: {
      required: number;
      actual: number;
      met: boolean;
    };
  };

  maintenance: {
    activeDirects: {
      required: number;
      actual: number;
      met: boolean;
    };
    monthlyVolume: {
      required: number;
      actual: number;
      met: boolean;
    };
    blockedBalance: {
      required: number;
      actual: number;
      met: boolean;
    };
  };
}

/**
 * Check if user meets conquest requirements for a rank
 */
export async function checkConquestRequirements(
  userId: string,
  targetRank: MLMRank
): Promise<RankRequirementsCheck> {
  const config = getRankRequirements(targetRank);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalDirects: true,
      lifetimeVolume: true,
      blockedBalance: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get current month date range for monthly volume
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  // Calculate monthly volume
  const monthlyVolume = await calculateNetworkVolume(
    userId,
    startOfMonth,
    endOfMonth
  );

  // Get active directs count
  const activeDirectsCount = await getActiveDirects(userId);

  // Convert Decimals to numbers for comparison
  const lifetimeVolumeNum = parseFloat(user.lifetimeVolume.toString());
  const blockedBalanceNum = parseFloat(user.blockedBalance.toString());
  const monthlyVolumeNum = parseFloat(monthlyVolume.toString());

  // Check conquest requirements
  const directsMet = user.totalDirects >= config.minDirects;
  const lifetimeVolumeMet = lifetimeVolumeNum >= config.minLifetimeVolume;
  const blockedBalanceMet = blockedBalanceNum >= config.minBlockedBalance;

  const conquestMet = directsMet && lifetimeVolumeMet && blockedBalanceMet;

  // Check maintenance requirements
  const activeDirectsMet = activeDirectsCount >= config.minActiveDirects;
  const monthlyVolumeMet = monthlyVolumeNum >= config.minMonthlyVolume;
  const maintenanceBlockedBalanceMet =
    blockedBalanceNum >= config.minBlockedBalance;

  const maintenanceMet =
    activeDirectsMet && monthlyVolumeMet && maintenanceBlockedBalanceMet;

  return {
    rank: targetRank,
    meetsRequirements: conquestMet && maintenanceMet,
    conquest: {
      directs: {
        required: config.minDirects,
        actual: user.totalDirects,
        met: directsMet,
      },
      lifetimeVolume: {
        required: config.minLifetimeVolume,
        actual: lifetimeVolumeNum,
        met: lifetimeVolumeMet,
      },
      blockedBalance: {
        required: config.minBlockedBalance,
        actual: blockedBalanceNum,
        met: blockedBalanceMet,
      },
    },
    maintenance: {
      activeDirects: {
        required: config.minActiveDirects,
        actual: activeDirectsCount,
        met: activeDirectsMet,
      },
      monthlyVolume: {
        required: config.minMonthlyVolume,
        actual: monthlyVolumeNum,
        met: monthlyVolumeMet,
      },
      blockedBalance: {
        required: config.minBlockedBalance,
        actual: blockedBalanceNum,
        met: maintenanceBlockedBalanceMet,
      },
    },
  };
}

/**
 * Check if user meets maintenance requirements ONLY (for current rank)
 */
export async function checkMaintenanceRequirements(
  userId: string
): Promise<{
  met: boolean;
  activeDirects: number;
  monthlyVolume: number;
  blockedBalance: number;
  requirements: {
    minActiveDirects: number;
    minMonthlyVolume: number;
    minBlockedBalance: number;
  };
}> {
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

  const config = getRankRequirements(user.currentRank);

  // Get current month date range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  // Calculate monthly stats
  const monthlyVolume = await calculateNetworkVolume(
    userId,
    startOfMonth,
    endOfMonth
  );
  const activeDirectsCount = await getActiveDirects(userId);

  const monthlyVolumeNum = parseFloat(monthlyVolume.toString());
  const blockedBalanceNum = parseFloat(user.blockedBalance.toString());

  // Check if requirements are met
  const activeDirectsMet = activeDirectsCount >= config.minActiveDirects;
  const monthlyVolumeMet = monthlyVolumeNum >= config.minMonthlyVolume;
  const blockedBalanceMet = blockedBalanceNum >= config.minBlockedBalance;

  const met = activeDirectsMet && monthlyVolumeMet && blockedBalanceMet;

  return {
    met,
    activeDirects: activeDirectsCount,
    monthlyVolume: monthlyVolumeNum,
    blockedBalance: blockedBalanceNum,
    requirements: {
      minActiveDirects: config.minActiveDirects,
      minMonthlyVolume: config.minMonthlyVolume,
      minBlockedBalance: config.minBlockedBalance,
    },
  };
}

/**
 * Get missing requirements for a rank (useful for UI)
 */
export async function getMissingRequirements(
  userId: string,
  targetRank: MLMRank
): Promise<string[]> {
  const check = await checkConquestRequirements(userId, targetRank);
  const missing: string[] = [];

  if (!check.conquest.directs.met) {
    const needed =
      check.conquest.directs.required - check.conquest.directs.actual;
    missing.push(
      `Precisa de mais ${needed} diretos (tem ${check.conquest.directs.actual}, precisa ${check.conquest.directs.required})`
    );
  }

  if (!check.conquest.lifetimeVolume.met) {
    const needed =
      check.conquest.lifetimeVolume.required -
      check.conquest.lifetimeVolume.actual;
    missing.push(`Precisa de mais $${needed.toFixed(2)} de volume vitalício`);
  }

  if (!check.conquest.blockedBalance.met) {
    const needed =
      check.conquest.blockedBalance.required -
      check.conquest.blockedBalance.actual;
    missing.push(
      `Precisa bloquear mais $${needed.toFixed(2)} (tem $${check.conquest.blockedBalance.actual.toFixed(2)}, precisa $${check.conquest.blockedBalance.required})`
    );
  }

  if (!check.maintenance.activeDirects.met) {
    const needed =
      check.maintenance.activeDirects.required -
      check.maintenance.activeDirects.actual;
    missing.push(`Precisa de mais ${needed} diretos ativos este mês`);
  }

  if (!check.maintenance.monthlyVolume.met) {
    const needed =
      check.maintenance.monthlyVolume.required -
      check.maintenance.monthlyVolume.actual;
    missing.push(`Precisa de mais $${needed.toFixed(2)} de volume mensal`);
  }

  return missing;
}
