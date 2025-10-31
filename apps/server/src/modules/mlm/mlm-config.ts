/**
 * MLM v1.0 Configuration
 *
 * Centralizes all MLM system constants, requirements, and business rules.
 * Based on PRD-MLM-v1.0.md
 */

import { MLMRank, LoyaltyTier } from "@prisma/client";

// ===== Rank Configuration =====

export interface RankRequirements {
  // Conquest (lifetime - never decreases)
  minDirects: number;
  minLifetimeVolume: number; // USD
  minBlockedBalance: number; // USD

  // Maintenance (monthly)
  minActiveDirects: number;
  minMonthlyVolume: number; // USD

  // Commissions (N0 = próprio saldo, N1 = diretos, N2/N3 = indiretos)
  commissions: {
    N0: number; // % - Comissão sobre próprio saldo (maior)
    N1: number; // % - Comissão sobre saldos dos diretos
    N2: number; // % - Comissão sobre saldos dos indiretos N2
    N3: number; // % - Comissão sobre saldos dos indiretos N3
  };

  // Withdrawal Fees
  withdrawalFee: {
    baseFee: number; // %
    cooldownDays: number;
    dailyLimit: number; // USD
  };
}

export const RANK_CONFIG: Record<MLMRank, RankRequirements> = {
  RECRUIT: {
    // Conquest
    minDirects: 0,
    minLifetimeVolume: 0,
    minBlockedBalance: 100,

    // Maintenance
    minActiveDirects: 0,
    minMonthlyVolume: 0,

    // Commissions
    commissions: {
      N0: 0.35, // 0.35% ao dia sobre próprio saldo (comissão principal)
      N1: 0.10, // 0.10% sobre saldos dos diretos
      N2: 0,
      N3: 0,
    },

    // Withdrawal
    withdrawalFee: {
      baseFee: 15, // 15%
      cooldownDays: 7,
      dailyLimit: 500,
    },
  },

  BRONZE: {
    // Conquest
    minDirects: 3,
    minLifetimeVolume: 2_500,
    minBlockedBalance: 500,

    // Maintenance (20% do volume de conquista)
    minActiveDirects: 3,
    minMonthlyVolume: 500, // 2,500 × 0.20

    // Commissions
    commissions: {
      N0: 1.05, // 1.05% ao dia sobre próprio saldo
      N1: 0.30, // 0.30% sobre saldos dos diretos
      N2: 0.05, // 0.05% sobre saldos dos indiretos N2
      N3: 0,
    },

    // Withdrawal
    withdrawalFee: {
      baseFee: 12, // 12%
      cooldownDays: 5,
      dailyLimit: 1_000,
    },
  },

  SILVER: {
    // Conquest
    minDirects: 5,
    minLifetimeVolume: 30_000,
    minBlockedBalance: 2_000,

    // Maintenance (20% do volume de conquista)
    minActiveDirects: 5,
    minMonthlyVolume: 6_000, // 30,000 × 0.20

    // Commissions
    commissions: {
      N0: 1.80, // 1.80% ao dia sobre próprio saldo
      N1: 0.50, // 0.50% sobre saldos dos diretos
      N2: 0.08, // 0.08% sobre saldos dos indiretos N2
      N3: 0.03, // 0.03% sobre saldos dos indiretos N3
    },

    // Withdrawal
    withdrawalFee: {
      baseFee: 10, // 10%
      cooldownDays: 3,
      dailyLimit: 2_500,
    },
  },

  GOLD: {
    // Conquest
    minDirects: 8,
    minLifetimeVolume: 150_000,
    minBlockedBalance: 5_000,

    // Maintenance (20% do volume de conquista)
    minActiveDirects: 8,
    minMonthlyVolume: 30_000, // 150,000 × 0.20

    // Commissions
    commissions: {
      N0: 2.60, // 2.60% ao dia sobre próprio saldo
      N1: 0.70, // 0.70% sobre saldos dos diretos
      N2: 0.12, // 0.12% sobre saldos dos indiretos N2
      N3: 0.05, // 0.05% sobre saldos dos indiretos N3
    },

    // Withdrawal
    withdrawalFee: {
      baseFee: 8, // 8%
      cooldownDays: 2,
      dailyLimit: 5_000,
    },
  },
};

// ===== Withdrawal Fee Configuration =====

export interface ProgressiveFeeConfig {
  firstWithdrawal: number; // %
  secondWithdrawal: number; // %
  thirdWithdrawal: number; // %
  fourthPlusWithdrawal: number; // %
}

export const PROGRESSIVE_FEE: ProgressiveFeeConfig = {
  firstWithdrawal: 0, // +0%
  secondWithdrawal: 3, // +3%
  thirdWithdrawal: 6, // +6%
  fourthPlusWithdrawal: 10, // +10%
};

export interface LoyaltyDiscountConfig {
  discount: number; // %
  minDaysSinceLastWithdrawal: number;
}

export const LOYALTY_DISCOUNT: Record<LoyaltyTier, LoyaltyDiscountConfig> = {
  NORMAL: {
    discount: 0, // -0%
    minDaysSinceLastWithdrawal: 0,
  },
  FAITHFUL: {
    discount: 2, // -2%
    minDaysSinceLastWithdrawal: 30,
  },
  LOYAL: {
    discount: 4, // -4%
    minDaysSinceLastWithdrawal: 90,
  },
  VETERAN: {
    discount: 6, // -6%
    minDaysSinceLastWithdrawal: 180,
  },
};

// ===== Downrank System =====

export const DOWNRANK_CONFIG = {
  gracePeriodDays: 7, // 7 dias após warning
  warningThreshold: 1, // 1º mês sem cumprir = WARNING
  temporaryDownrankThreshold: 2, // 2º mês = TEMPORARY_DOWNRANK (-1)
  permanentDownrankThreshold: 3, // 3º mês = DOWNRANKED (-2)
  temporaryDownrankPenalty: 1, // Perde 1 rank
  permanentDownrankPenalty: 2, // Perde 2 ranks do original
};

// ===== Active User Definition =====

export const ACTIVE_USER_CONFIG = {
  minBalance: 100, // USD
  maxDaysSinceLastLogin: 30,
  requiredStatus: "ACTIVE" as const,
};

// ===== Helper Functions =====

/**
 * Get rank requirements by rank
 */
export function getRankRequirements(rank: MLMRank): RankRequirements {
  return RANK_CONFIG[rank];
}

/**
 * Get next rank (null if already at max)
 */
export function getNextRank(currentRank: MLMRank): MLMRank | null {
  const ranks: MLMRank[] = ["RECRUIT", "BRONZE", "SILVER", "GOLD"];
  const currentIndex = ranks.indexOf(currentRank);

  if (currentIndex === -1 || currentIndex === ranks.length - 1) {
    return null;
  }

  return ranks[currentIndex + 1];
}

/**
 * Get previous rank (null if already at min)
 */
export function getPreviousRank(currentRank: MLMRank): MLMRank | null {
  const ranks: MLMRank[] = ["RECRUIT", "BRONZE", "SILVER", "GOLD"];
  const currentIndex = ranks.indexOf(currentRank);

  if (currentIndex === -1 || currentIndex === 0) {
    return null;
  }

  return ranks[currentIndex - 1];
}

/**
 * Downgrade rank by N levels
 */
export function downgradeRank(currentRank: MLMRank, levels: number): MLMRank {
  const ranks: MLMRank[] = ["RECRUIT", "BRONZE", "SILVER", "GOLD"];
  const currentIndex = ranks.indexOf(currentRank);

  if (currentIndex === -1) {
    return currentRank;
  }

  const newIndex = Math.max(0, currentIndex - levels);
  return ranks[newIndex];
}

/**
 * Calculate progressive fee based on withdrawal count in month
 */
export function calculateProgressiveFee(withdrawalCount: number): number {
  if (withdrawalCount === 0) return PROGRESSIVE_FEE.firstWithdrawal;
  if (withdrawalCount === 1) return PROGRESSIVE_FEE.secondWithdrawal;
  if (withdrawalCount === 2) return PROGRESSIVE_FEE.thirdWithdrawal;
  return PROGRESSIVE_FEE.fourthPlusWithdrawal;
}

/**
 * Calculate loyalty tier based on days since last withdrawal
 */
export function calculateLoyaltyTier(daysSinceLastWithdrawal: number): LoyaltyTier {
  if (daysSinceLastWithdrawal >= 180) return "VETERAN";
  if (daysSinceLastWithdrawal >= 90) return "LOYAL";
  if (daysSinceLastWithdrawal >= 30) return "FAITHFUL";
  return "NORMAL";
}

/**
 * Get loyalty discount percentage
 */
export function getLoyaltyDiscount(tier: LoyaltyTier): number {
  return LOYALTY_DISCOUNT[tier].discount;
}

/**
 * Calculate total withdrawal fee
 */
export function calculateWithdrawalFee(
  rank: MLMRank,
  withdrawalCount: number,
  loyaltyTier: LoyaltyTier
): {
  baseFee: number;
  progressiveFee: number;
  loyaltyDiscount: number;
  totalFee: number;
} {
  const baseFee = RANK_CONFIG[rank].withdrawalFee.baseFee;
  const progressiveFee = calculateProgressiveFee(withdrawalCount);
  const loyaltyDiscount = getLoyaltyDiscount(loyaltyTier);

  const totalFee = baseFee + progressiveFee - loyaltyDiscount;

  return {
    baseFee,
    progressiveFee,
    loyaltyDiscount,
    totalFee: Math.max(0, totalFee), // Não pode ser negativo
  };
}

/**
 * Get max depth for rank (how many levels receive commissions)
 */
export function getMaxCommissionDepth(rank: MLMRank): number {
  if (rank === "RECRUIT") return 1; // Apenas N1
  if (rank === "BRONZE") return 2; // N1, N2
  return 3; // N1, N2, N3 (SILVER e GOLD)
}

/**
 * Check if user is active (for monthly maintenance)
 */
export function isUserActive(
  balance: number,
  daysSinceLastLogin: number,
  status: string
): boolean {
  return (
    balance >= ACTIVE_USER_CONFIG.minBalance &&
    daysSinceLastLogin <= ACTIVE_USER_CONFIG.maxDaysSinceLastLogin &&
    status === ACTIVE_USER_CONFIG.requiredStatus
  );
}
