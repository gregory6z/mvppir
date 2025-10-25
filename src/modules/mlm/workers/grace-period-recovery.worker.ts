/**
 * Grace Period Recovery Worker
 *
 * Checks if users in WARNING status recovered during their 7-day grace period.
 *
 * Schedule: 12:00 UTC daily
 * Logic:
 *   - Find users with status WARNING and grace period still active
 *   - Check if they met requirements
 *   - If yes → Reset to ACTIVE (recovery success!)
 *   - If no → Do nothing (monthly maintenance will handle downrank)
 */

import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { QUEUE_NAMES } from "@/lib/queues";
import { prisma } from "@/lib/prisma";
import { checkMaintenanceRequirements } from "@/modules/mlm/use-cases/calculate-rank-requirements";

/**
 * Process grace period recovery job
 */
async function processGracePeriodRecovery(job: Job) {
  const startTime = Date.now();

  job.log("Starting grace period recovery check...");

  const now = new Date();

  // Get all users in WARNING status with active grace period
  const users = await prisma.user.findMany({
    where: {
      rankStatus: "WARNING",
      gracePeriodEndsAt: {
        gte: now, // Grace period still active
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      currentRank: true,
      gracePeriodEndsAt: true,
    },
  });

  job.log(`Found ${users.length} users in WARNING status with active grace period`);

  let totalChecked = 0;
  let totalRecovered = 0;
  let totalStillFailing = 0;

  // Check each user
  for (const user of users) {
    try {
      await job.updateProgress((totalChecked / users.length) * 100);

      job.log(
        `Checking user: ${user.email} (${user.currentRank}) - Grace period ends: ${user.gracePeriodEndsAt?.toISOString()}`
      );

      // Check if user now meets maintenance requirements
      const maintenanceCheck = await checkMaintenanceRequirements(user.id);

      if (maintenanceCheck.met) {
        // User recovered! 🎉
        await prisma.user.update({
          where: { id: user.id },
          data: {
            warningCount: 0,
            rankStatus: "ACTIVE",
            gracePeriodEndsAt: null,
            originalRank: null, // Clear any temporary downrank state
          },
        });

        job.log(`✅ User ${user.email} RECOVERED from WARNING!`);
        totalRecovered++;

        // TODO: Send email notification
        // await sendEmail(user.email, "grace-period-success");
      } else {
        // User still failing requirements
        job.log(
          `⚠️  User ${user.email} still not meeting requirements (activeDirects: ${maintenanceCheck.activeDirects}/${maintenanceCheck.requirements.minActiveDirects}, volume: $${maintenanceCheck.monthlyVolume}/$${maintenanceCheck.requirements.minMonthlyVolume})`
        );
        totalStillFailing++;

        // Do nothing - monthly maintenance will handle downrank if they don't recover by month end
      }

      totalChecked++;
    } catch (error) {
      job.log(
        `Error checking user ${user.email}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      // Continue with next user
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  const summary = {
    usersChecked: totalChecked,
    recovered: totalRecovered,
    stillFailing: totalStillFailing,
    durationSeconds: duration,
  };

  job.log(`Grace period recovery completed: ${JSON.stringify(summary)}`);

  return summary;
}

/**
 * Create and start the worker
 */
export function startGracePeriodRecoveryWorker() {
  const worker = new Worker(
    QUEUE_NAMES.GRACE_PERIOD_RECOVERY,
    processGracePeriodRecovery,
    {
      connection: redis,
      concurrency: 1, // Process one job at a time
    }
  );

  worker.on("completed", (job) => {
    console.log(
      `✅ Grace period recovery job ${job.id} completed:`,
      job.returnvalue
    );
  });

  worker.on("failed", (job, err) => {
    console.error(
      `❌ Grace period recovery job ${job?.id} failed:`,
      err.message
    );
  });

  worker.on("error", (err) => {
    console.error("❌ Grace period recovery worker error:", err);
  });

  console.log("✅ Grace period recovery worker started");

  return worker;
}
