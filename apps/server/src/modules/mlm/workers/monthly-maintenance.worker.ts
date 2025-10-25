/**
 * Monthly Maintenance Worker
 *
 * Checks if users met monthly requirements and handles the 3-month downrank flow.
 *
 * Schedule: 1st of every month at 00:00 UTC
 * Flow:
 *   MÊS 1: Não cumpriu → WARNING (grace period 7 dias)
 *   MÊS 2: Ainda não cumpriu → TEMPORARY_DOWNRANK (-1 rank)
 *   MÊS 3: Ainda não cumpriu → DOWNRANKED (-2 ranks do original)
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

  job.log("Starting monthly maintenance check...");

  // Get last month info
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthName = lastMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  job.log(`Checking requirements for: ${monthName}`);

  // Get all active users (excluding RECRUIT - they don't have maintenance requirements)
  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      currentRank: {
        not: "RECRUIT", // RECRUIT has no maintenance requirements
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
    },
  });

  job.log(`Found ${users.length} users to check`);

  let totalProcessed = 0;
  let totalWarnings = 0;
  let totalTemporaryDownranks = 0;
  let totalPermanentDownranks = 0;
  let totalRecoveries = 0;

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
        // User did NOT meet requirements
        await handleMaintenanceFailure(user, job);

        // Count stats
        const newWarningCount = user.warningCount + 1;
        if (newWarningCount === 1) totalWarnings++;
        else if (newWarningCount === 2) totalTemporaryDownranks++;
        else if (newWarningCount === 3) totalPermanentDownranks++;
      } else {
        // User MET requirements
        if (user.warningCount > 0 || user.rankStatus !== "ACTIVE") {
          // User was in warning/downrank but recovered!
          await prisma.user.update({
            where: { id: user.id },
            data: {
              warningCount: 0,
              rankStatus: "ACTIVE",
              gracePeriodEndsAt: null,
              originalRank: null,
            },
          });

          job.log(`✅ User ${user.email} recovered from ${user.rankStatus}!`);
          totalRecoveries++;
        } else {
          job.log(`✅ User ${user.email} met all requirements`);
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
    month: monthName,
    usersChecked: totalProcessed,
    warnings: totalWarnings,
    temporaryDownranks: totalTemporaryDownranks,
    permanentDownranks: totalPermanentDownranks,
    recoveries: totalRecoveries,
    durationSeconds: duration,
  };

  job.log(`Monthly maintenance completed: ${JSON.stringify(summary)}`);

  return summary;
}

/**
 * Handle user who did NOT meet monthly requirements
 * Implements the 3-month downrank flow
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
) {
  const newWarningCount = user.warningCount + 1;

  if (newWarningCount === DOWNRANK_CONFIG.warningThreshold) {
    // MÊS 1: Aviso
    const gracePeriodEnds = new Date();
    gracePeriodEnds.setDate(
      gracePeriodEnds.getDate() + DOWNRANK_CONFIG.gracePeriodDays
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        warningCount: newWarningCount,
        rankStatus: "WARNING",
        gracePeriodEndsAt: gracePeriodEnds,
        originalRank: user.currentRank, // Save current rank
      },
    });

    job.log(
      `⚠️  ${user.email}: WARNING (grace period until ${gracePeriodEnds.toISOString()})`
    );

    // TODO: Send email notification
    // await sendEmail(user.email, "warning-month-1", { gracePeriodEnds });
  } else if (newWarningCount === DOWNRANK_CONFIG.temporaryDownrankThreshold) {
    // MÊS 2: Downrank temporário -1
    const newRank = downgradeRank(
      user.currentRank,
      DOWNRANK_CONFIG.temporaryDownrankPenalty
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        warningCount: newWarningCount,
        rankStatus: "TEMPORARY_DOWNRANK",
        currentRank: newRank,
        // originalRank stays the same (keeps reference to original)
      },
    });

    job.log(
      `⚠️  ${user.email}: TEMPORARY_DOWNRANK (${user.currentRank} → ${newRank})`
    );

    // TODO: Send email notification
    // await sendEmail(user.email, "downrank-temporary", { oldRank: user.currentRank, newRank });
  } else if (newWarningCount >= DOWNRANK_CONFIG.permanentDownrankThreshold) {
    // MÊS 3: Downrank permanente -2 do rank original
    const originalRank = user.originalRank || user.currentRank;
    const newRank = downgradeRank(
      originalRank,
      DOWNRANK_CONFIG.permanentDownrankPenalty
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        warningCount: 0, // Reset counter
        rankStatus: "DOWNRANKED",
        currentRank: newRank,
        originalRank: null, // Clear original rank
        gracePeriodEndsAt: null,
        rankConqueredAt: new Date(), // New conquest date
      },
    });

    job.log(
      `❌ ${user.email}: DOWNRANKED PERMANENTLY (${originalRank} → ${newRank})`
    );

    // TODO: Send email notification
    // await sendEmail(user.email, "downrank-permanent", { oldRank: originalRank, newRank });
  }
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
