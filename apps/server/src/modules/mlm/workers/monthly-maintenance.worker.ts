/**
 * Monthly Maintenance Worker (Individual Cycles)
 *
 * Checks if users met monthly requirements and handles immediate downrank/upgrade.
 *
 * Schedule: Every day at 00:00 UTC (ciclo individual por usuário)
 * Flow:
 *   - Processa apenas usuários com nextMaintenanceCheck <= hoje
 *   - Se NÃO cumpriu requisitos mensais → Downgrade imediato (-1 rank)
 *   - Se cumpriu requisitos mensais → Mantém rank ou verifica upgrade
 *   - Atualiza nextMaintenanceCheck para +30 dias após processamento
 */

import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { QUEUE_NAMES } from "@/lib/queues";
import { prisma } from "@/lib/prisma";
import { calculateLastMonthStats } from "@/modules/mlm/use-cases/calculate-monthly-stats";
import { downgradeRank, DOWNRANK_CONFIG } from "@/modules/mlm/mlm-config";
import { MLMRank } from "@prisma/client";

/**
 * Process monthly maintenance job
 */
async function processMonthlyMaintenance(job: Job) {
  const startTime = Date.now();

  job.log("Starting individual maintenance check...");

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  job.log(`Checking users with maintenance due on or before: ${today.toISOString()}`);

  // Get all active users (excluding RECRUIT) whose nextMaintenanceCheck is due (ciclo individual)
  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      currentRank: {
        not: "RECRUIT", // RECRUIT has no maintenance requirements
      },
      nextMaintenanceCheck: {
        lte: today, // Only users whose maintenance is due
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      currentRank: true,
      rankStatus: true,
      warningCount: true,
      originalRank: true,
      nextMaintenanceCheck: true,
    },
  });

  job.log(`Found ${users.length} users to check`);

  let totalProcessed = 0;
  let totalDownranks = 0;
  let totalUpgrades = 0;
  let totalMaintained = 0;

  // Process each user
  for (const user of users) {
    try {
      await job.updateProgress((totalProcessed / users.length) * 100);

      job.log(`Processing user: ${user.email} (${user.currentRank})`);

      // Calculate and save last month's stats
      const stats = await calculateLastMonthStats(user.id);

      job.log(
        `Stats for ${user.email}: activeDirects=${stats.activeDirects}, volume=${stats.totalVolume}, met=${stats.metRequirements}`
      );

      if (!stats.metRequirements) {
        // User did NOT meet requirements → Downgrade imediato
        const downgraded = await handleMaintenanceFailure(user, job);
        if (downgraded) {
          totalDownranks++;
        }
      } else {
        // User MET requirements → Check for upgrade
        const upgraded = await handleMaintenanceSuccess(user, job);
        if (upgraded) {
          totalUpgrades++;
        } else {
          totalMaintained++;
          job.log(`✅ User ${user.email} met all requirements - rank maintained`);
        }
      }

      totalProcessed++;

      if (totalProcessed % 50 === 0) {
        job.log(`Progress: ${totalProcessed}/${users.length} users`);
      }
    } catch (error) {
      job.log(
        `Error processing user ${user.email}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      // Continue with next user
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  const summary = {
    date: today.toISOString(),
    usersChecked: totalProcessed,
    downranks: totalDownranks,
    upgrades: totalUpgrades,
    maintained: totalMaintained,
    durationSeconds: duration,
  };

  job.log(`Individual maintenance completed: ${JSON.stringify(summary)}`);

  return summary;
}

/**
 * Handle user who did NOT meet monthly requirements
 * Downgrade immediately by 1 rank
 */
async function handleMaintenanceFailure(
  user: {
    id: string;
    email: string;
    currentRank: MLMRank;
    warningCount: number;
    originalRank: MLMRank | null;
  },
  job: Job
): Promise<boolean> {
  // Check if user can be downgraded (already at RECRUIT = can't go lower)
  if (user.currentRank === "RECRUIT") {
    job.log(`⚠️  ${user.email}: Already at RECRUIT rank - cannot downgrade`);
    return false;
  }

  // Downgrade by 1 rank
  const oldRank = user.currentRank;
  const newRank = downgradeRank(user.currentRank, 1);

  // Calculate next maintenance check (+30 days)
  const nextCheck = new Date();
  nextCheck.setDate(nextCheck.getDate() + 30);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      currentRank: newRank,
      rankStatus: "DOWNRANKED",
      rankConqueredAt: new Date(), // New conquest date
      warningCount: 0, // Reset warnings
      originalRank: null,
      gracePeriodEndsAt: null,
      nextMaintenanceCheck: nextCheck, // Próxima verificação em 30 dias
    },
  });

  job.log(
    `⬇️  ${user.email}: DOWNRANKED (${oldRank} → ${newRank}) - did not meet monthly requirements`
  );

  // TODO: Send email notification
  // await sendEmail(user.email, "downrank-monthly", { oldRank, newRank });

  return true;
}

/**
 * Handle user who MET monthly requirements
 * Check if they can be upgraded to next rank
 */
async function handleMaintenanceSuccess(
  user: {
    id: string;
    email: string;
    currentRank: MLMRank;
  },
  job: Job
): Promise<boolean> {
  // Import here to avoid circular dependency
  const { autoCheckAndPromote } = await import(
    "@/modules/mlm/use-cases/check-rank-progression"
  );

  // Try to upgrade user automatically
  const promoted = await autoCheckAndPromote(user.id);

  if (promoted) {
    job.log(`⬆️  ${user.email}: Auto-promoted to next rank!`);
  }

  // Update next maintenance check (+30 days)
  const nextCheck = new Date();
  nextCheck.setDate(nextCheck.getDate() + 30);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      nextMaintenanceCheck: nextCheck, // Próxima verificação em 30 dias
    },
  });

  job.log(`📅 ${user.email}: Next maintenance check scheduled for ${nextCheck.toISOString()}`);

  return promoted;
}

/**
 * Create and start the worker
 */
export function startMonthlyMaintenanceWorker() {
  const worker = new Worker(
    QUEUE_NAMES.MONTHLY_MAINTENANCE,
    processMonthlyMaintenance,
    {
      connection: redis,
      concurrency: 1, // Process one job at a time (critical monthly job)
    }
  );

  worker.on("completed", (job) => {
    console.log(
      `✅ Monthly maintenance job ${job.id} completed:`,
      job.returnvalue
    );
  });

  worker.on("failed", (job, err) => {
    console.error(
      `❌ Monthly maintenance job ${job?.id} failed:`,
      err.message
    );
  });

  worker.on("error", (err) => {
    console.error("❌ Monthly maintenance worker error:", err);
  });

  console.log("✅ Monthly maintenance worker started");

  return worker;
}
