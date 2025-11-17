/**
 * Get User MLM Profile Use Case
 *
 * Returns complete MLM profile for a user including:
 * - Current rank and status
 * - Network statistics
 * - Requirements check
 * - Warning status (if any)
 * - Next rank preview
 */

import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { MLMRank, RankStatus } from "@prisma/client";
import { getNetworkStats } from "@/modules/mlm/helpers/network";
import {
  checkConquestRequirements,
  checkMaintenanceRequirements,
} from "./calculate-rank-requirements";
import { checkRankProgression } from "./check-rank-progression";
import { getNextRank, getRankRequirements } from "@/modules/mlm/mlm-config";

export interface MLMProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    currentRank: MLMRank;
    rankStatus: RankStatus;
    rankConqueredAt: Date | null;
    blockedBalance: number;
    totalInvested: number; // Total de depósitos USDC/USDT (para slider)
    loyaltyTier: string;
  };

  network: {
    totalDirects: number;
    activeDirects: number;
    lifetimeVolume: number;
    monthlyVolume: number;
    levels: {
      N1: { count: number; totalBalance: number };
      N2: { count: number; totalBalance: number };
      N3: { count: number; totalBalance: number };
    };
  };

  currentRankRequirements: {
    maintenance: {
      activeDirects: { required: number; actual: number; met: boolean };
      monthlyVolume: { required: number; actual: number; met: boolean };
      blockedBalance: { required: number; actual: number; met: boolean };
    };
    met: boolean;
  };

  nextRankPreview?: {
    rank: MLMRank;
    canProgress: boolean;
    requirements: {
      directs: { required: number; actual: number; met: boolean };
      lifetimeVolume: { required: number; actual: number; met: boolean };
      blockedBalance: { required: number; actual: number; met: boolean };
    };
    missingRequirements: string[];
  };

  warning?: {
    status: RankStatus;
    warningCount: number;
    gracePeriodEndsAt: Date | null;
    message: string;
  };

  commissionRates: {
    N0: number;
    N1: number;
    N2: number;
    N3: number;
  };
}

/**
 * Get complete MLM profile for user
 */
export async function getUserMLMProfile(
  userId: string
): Promise<MLMProfileResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      currentRank: true,
      rankStatus: true,
      rankConqueredAt: true,
      blockedBalance: true,
      loyaltyTier: true,
      totalDirects: true,
      lifetimeVolume: true,
      warningCount: true,
      gracePeriodEndsAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get total deposits (USDC + USDT only) - for blocking slider
  const totalDeposits = await prisma.walletTransaction.aggregate({
    where: {
      userId,
      type: "CREDIT",
      status: "CONFIRMED",
      tokenSymbol: { in: ["USDC", "USDT"] },
    },
    _sum: {
      amount: true,
    },
  });

  // Total deposited (investimento total do usuário)
  const totalInvested = totalDeposits._sum.amount || new Decimal(0);

  // Get network statistics
  const networkStats = await getNetworkStats(userId);

  // Check current rank maintenance requirements
  const maintenanceCheck = await checkMaintenanceRequirements(userId);

  // Build current rank requirements response
  const currentRankRequirements = {
    maintenance: {
      activeDirects: {
        required: maintenanceCheck.requirements.minActiveDirects,
        actual: maintenanceCheck.activeDirects,
        met:
          maintenanceCheck.activeDirects >=
          maintenanceCheck.requirements.minActiveDirects,
      },
      monthlyVolume: {
        required: maintenanceCheck.requirements.minMonthlyVolume,
        actual: maintenanceCheck.monthlyVolume,
        met:
          maintenanceCheck.monthlyVolume >=
          maintenanceCheck.requirements.minMonthlyVolume,
      },
      blockedBalance: {
        required: maintenanceCheck.requirements.minBlockedBalance,
        actual: maintenanceCheck.blockedBalance,
        met:
          maintenanceCheck.blockedBalance >=
          maintenanceCheck.requirements.minBlockedBalance,
      },
    },
    met: maintenanceCheck.met,
  };

  // Check next rank progression
  const nextRank = getNextRank(user.currentRank);
  let nextRankPreview;

  if (nextRank) {
    const progression = await checkRankProgression(userId);
    const nextRankCheck = await checkConquestRequirements(userId, nextRank);

    const missingRequirements: string[] = [];

    if (!nextRankCheck.conquest.directs.met) {
      const needed =
        nextRankCheck.conquest.directs.required -
        nextRankCheck.conquest.directs.actual;
      missingRequirements.push(`Faltam ${needed} diretos`);
    }

    if (!nextRankCheck.conquest.lifetimeVolume.met) {
      const needed =
        nextRankCheck.conquest.lifetimeVolume.required -
        nextRankCheck.conquest.lifetimeVolume.actual;
      missingRequirements.push(
        `Faltam $${needed.toFixed(2)} de volume vitalício`
      );
    }

    if (!nextRankCheck.conquest.blockedBalance.met) {
      const needed =
        nextRankCheck.conquest.blockedBalance.required -
        nextRankCheck.conquest.blockedBalance.actual;
      missingRequirements.push(`Faltam $${needed.toFixed(2)} bloqueados`);
    }

    nextRankPreview = {
      rank: nextRank,
      canProgress: progression.canProgress,
      requirements: {
        directs: nextRankCheck.conquest.directs,
        lifetimeVolume: nextRankCheck.conquest.lifetimeVolume,
        blockedBalance: nextRankCheck.conquest.blockedBalance,
      },
      missingRequirements,
    };
  }

  // Warning status
  let warning;
  if (user.rankStatus !== "ACTIVE") {
    const messages = {
      WARNING:
        "Atenção! Você não cumpriu os requisitos mensais. Você tem 7 dias para regularizar.",
      TEMPORARY_DOWNRANK:
        "Seu rank foi temporariamente reduzido. Cumpra os requisitos para recuperar.",
      DOWNRANKED:
        "Seu rank foi permanentemente reduzido. Conquiste novamente os requisitos para subir.",
    };

    warning = {
      status: user.rankStatus,
      warningCount: user.warningCount,
      gracePeriodEndsAt: user.gracePeriodEndsAt,
      message:
        messages[user.rankStatus as keyof typeof messages] ||
        "Status desconhecido",
    };
  }

  // Get commission rates for current rank
  const rankConfig = getRankRequirements(user.currentRank);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      currentRank: user.currentRank,
      rankStatus: user.rankStatus,
      rankConqueredAt: user.rankConqueredAt,
      blockedBalance: parseFloat(user.blockedBalance.toString()),
      totalInvested: parseFloat(totalInvested.toString()),
      loyaltyTier: user.loyaltyTier,
    },
    network: {
      totalDirects: user.totalDirects,
      activeDirects: maintenanceCheck.activeDirects,
      lifetimeVolume: parseFloat(user.lifetimeVolume.toString()),
      monthlyVolume: maintenanceCheck.monthlyVolume,
      levels: {
        N1: {
          count: networkStats.N1.count,
          totalBalance: parseFloat(networkStats.N1.totalBalance.toString()),
        },
        N2: {
          count: networkStats.N2.count,
          totalBalance: parseFloat(networkStats.N2.totalBalance.toString()),
        },
        N3: {
          count: networkStats.N3.count,
          totalBalance: parseFloat(networkStats.N3.totalBalance.toString()),
        },
      },
    },
    currentRankRequirements,
    nextRankPreview,
    warning,
    commissionRates: {
      N0: rankConfig.commissions.N0,
      N1: rankConfig.commissions.N1,
      N2: rankConfig.commissions.N2,
      N3: rankConfig.commissions.N3,
    },
  };
}
