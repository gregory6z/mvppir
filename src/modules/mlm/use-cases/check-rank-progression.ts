/**
 * Check Rank Progression Use Case
 *
 * Verifies if a user can be promoted to next rank and performs the upgrade.
 * Should be called:
 * - After a deposit is confirmed (auto-check)
 * - After a new referral is added
 * - Manually by admin
 */

import { prisma } from "@/lib/prisma";
import { getNextRank } from "@/modules/mlm/mlm-config";
import { MLMRank } from "@prisma/client";
import { checkConquestRequirements } from "./calculate-rank-requirements";

export interface RankProgressionResult {
  canProgress: boolean;
  currentRank: MLMRank;
  nextRank: MLMRank | null;
  promoted: boolean;
  reason?: string;
}

/**
 * Check if user can progress to next rank
 *
 * Returns true if user meets ALL conquest requirements for next rank.
 */
export async function checkRankProgression(
  userId: string
): Promise<RankProgressionResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentRank: true,
      rankStatus: true,
      status: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Cannot progress if user is blocked
  if (user.status === "BLOCKED") {
    return {
      canProgress: false,
      currentRank: user.currentRank,
      nextRank: null,
      promoted: false,
      reason: "User is blocked",
    };
  }

  // Get next rank
  const nextRank = getNextRank(user.currentRank);

  if (!nextRank) {
    return {
      canProgress: false,
      currentRank: user.currentRank,
      nextRank: null,
      promoted: false,
      reason: "Already at maximum rank",
    };
  }

  // Check if user meets requirements for next rank
  const requirements = await checkConquestRequirements(userId, nextRank);

  if (!requirements.meetsRequirements) {
    return {
      canProgress: false,
      currentRank: user.currentRank,
      nextRank,
      promoted: false,
      reason: "Requirements not met",
    };
  }

  // User meets requirements! Promote them
  return {
    canProgress: true,
    currentRank: user.currentRank,
    nextRank,
    promoted: false, // Not promoted yet, need to call promoteUser()
  };
}

/**
 * Promote user to next rank
 *
 * This function should only be called after checkRankProgression confirms the user can progress.
 * It updates the user's rank and resets warning count.
 */
export async function promoteUser(userId: string): Promise<{
  success: boolean;
  previousRank: MLMRank;
  newRank: MLMRank;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentRank: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const nextRank = getNextRank(user.currentRank);

  if (!nextRank) {
    throw new Error("Cannot promote: user is already at maximum rank");
  }

  // Verify requirements one more time (safety check)
  const requirements = await checkConquestRequirements(userId, nextRank);

  if (!requirements.meetsRequirements) {
    throw new Error("Cannot promote: requirements not met");
  }

  // Promote user
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentRank: nextRank,
      rankStatus: "ACTIVE",
      rankConqueredAt: new Date(),
      warningCount: 0, // Reset warnings on promotion
      originalRank: null, // Clear temporary downrank state
      gracePeriodEndsAt: null,
    },
  });

  console.log(
    `✅ User ${userId} promoted from ${user.currentRank} to ${nextRank}`
  );

  return {
    success: true,
    previousRank: user.currentRank,
    newRank: nextRank,
  };
}

/**
 * Auto-check and promote user if eligible
 *
 * Convenience function that checks requirements and promotes automatically.
 * Returns true if user was promoted.
 */
export async function autoCheckAndPromote(userId: string): Promise<boolean> {
  const progression = await checkRankProgression(userId);

  if (progression.canProgress && progression.nextRank) {
    await promoteUser(userId);
    return true;
  }

  return false;
}

/**
 * Check if user can be promoted to a specific rank (skip intermediate ranks)
 *
 * Useful for admin manual promotion or recovery from downrank.
 */
export async function canPromoteToRank(
  userId: string,
  targetRank: MLMRank
): Promise<{
  canPromote: boolean;
  reason?: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentRank: true,
      status: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status === "BLOCKED") {
    return {
      canPromote: false,
      reason: "User is blocked",
    };
  }

  // Check if target rank is higher than current
  const ranks: MLMRank[] = ["RECRUIT", "BRONZE", "SILVER", "GOLD"];
  const currentIndex = ranks.indexOf(user.currentRank);
  const targetIndex = ranks.indexOf(targetRank);

  if (targetIndex <= currentIndex) {
    return {
      canPromote: false,
      reason: "Target rank must be higher than current rank",
    };
  }

  // Check requirements
  const requirements = await checkConquestRequirements(userId, targetRank);

  if (!requirements.meetsRequirements) {
    return {
      canPromote: false,
      reason: "Requirements not met for target rank",
    };
  }

  return {
    canPromote: true,
  };
}

/**
 * Manually promote user to specific rank (admin only)
 *
 * WARNING: This bypasses normal progression checks. Use with caution.
 */
export async function forcePromoteToRank(
  userId: string,
  targetRank: MLMRank,
  adminId: string
): Promise<{
  success: boolean;
  previousRank: MLMRank;
  newRank: MLMRank;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentRank: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Log admin action
  await prisma.adminLog.create({
    data: {
      adminId,
      action: "FORCE_PROMOTE_USER",
      entityId: userId,
      details: {
        previousRank: user.currentRank,
        newRank: targetRank,
      },
    },
  });

  // Promote user
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentRank: targetRank,
      rankStatus: "ACTIVE",
      rankConqueredAt: new Date(),
      warningCount: 0,
      originalRank: null,
      gracePeriodEndsAt: null,
    },
  });

  console.log(
    `⚠️  Admin ${adminId} force promoted user ${userId} from ${user.currentRank} to ${targetRank}`
  );

  return {
    success: true,
    previousRank: user.currentRank,
    newRank: targetRank,
  };
}
