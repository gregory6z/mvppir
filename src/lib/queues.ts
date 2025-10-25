/**
 * BullMQ Queues Configuration
 *
 * Centralizes all queue definitions for the MLM system.
 */

import { Queue } from "bullmq";
import { redis } from "./redis";

// Queue names
export const QUEUE_NAMES = {
  DAILY_COMMISSIONS: "mlm-daily-commissions",
  MONTHLY_MAINTENANCE: "mlm-monthly-maintenance",
  GRACE_PERIOD_RECOVERY: "mlm-grace-period-recovery",
} as const;

// Redis connection config for BullMQ
const connection = redis;

/**
 * Daily Commissions Queue
 *
 * Calculates and credits daily commissions for all users.
 * Runs at 00:05 UTC every day.
 */
export const dailyCommissionsQueue = new Queue(
  QUEUE_NAMES.DAILY_COMMISSIONS,
  {
    connection,
    defaultJobOptions: {
      attempts: 3, // Retry up to 3 times
      backoff: {
        type: "exponential",
        delay: 60000, // Start with 1 minute delay
      },
      removeOnComplete: {
        age: 86400, // Keep completed jobs for 24 hours
        count: 100, // Keep last 100 completed jobs
      },
      removeOnFail: {
        age: 604800, // Keep failed jobs for 7 days
      },
    },
  }
);

/**
 * Monthly Maintenance Queue
 *
 * Checks if users met monthly requirements and handles downrank flow.
 * Runs on the 1st of every month at 00:00 UTC.
 */
export const monthlyMaintenanceQueue = new Queue(
  QUEUE_NAMES.MONTHLY_MAINTENANCE,
  {
    connection,
    defaultJobOptions: {
      attempts: 5, // Critical job - retry more times
      backoff: {
        type: "exponential",
        delay: 120000, // Start with 2 minutes delay
      },
      removeOnComplete: {
        age: 2592000, // Keep for 30 days
        count: 12, // Keep last 12 monthly runs
      },
      removeOnFail: false, // Never remove failed monthly jobs (manual review)
    },
  }
);

/**
 * Grace Period Recovery Queue
 *
 * Checks if users in WARNING status recovered during grace period.
 * Runs at 12:00 UTC every day.
 */
export const gracePeriodRecoveryQueue = new Queue(
  QUEUE_NAMES.GRACE_PERIOD_RECOVERY,
  {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 60000,
      },
      removeOnComplete: {
        age: 86400,
        count: 100,
      },
      removeOnFail: {
        age: 259200, // Keep failed for 3 days
      },
    },
  }
);

/**
 * Initialize all repeatable jobs (cron schedules)
 */
export async function initializeRepeatingJobs() {
  // Daily commissions at 00:05 UTC
  await dailyCommissionsQueue.add(
    "calculate-daily",
    {},
    {
      repeat: {
        pattern: "5 0 * * *", // Every day at 00:05 UTC
        tz: "UTC",
      },
      jobId: "daily-commissions-cron", // Prevent duplicates
    }
  );

  console.log("✅ Daily commissions job scheduled (00:05 UTC)");

  // Monthly maintenance on 1st at 00:00 UTC
  await monthlyMaintenanceQueue.add(
    "check-monthly",
    {},
    {
      repeat: {
        pattern: "0 0 1 * *", // 1st of every month at 00:00 UTC
        tz: "UTC",
      },
      jobId: "monthly-maintenance-cron",
    }
  );

  console.log("✅ Monthly maintenance job scheduled (1st at 00:00 UTC)");

  // Grace period recovery at 12:00 UTC
  await gracePeriodRecoveryQueue.add(
    "check-recovery",
    {},
    {
      repeat: {
        pattern: "0 12 * * *", // Every day at 12:00 UTC
        tz: "UTC",
      },
      jobId: "grace-period-recovery-cron",
    }
  );

  console.log("✅ Grace period recovery job scheduled (12:00 UTC)");
}

/**
 * Clean up all queues (for testing/shutdown)
 */
export async function cleanupQueues() {
  await dailyCommissionsQueue.close();
  await monthlyMaintenanceQueue.close();
  await gracePeriodRecoveryQueue.close();
  console.log("✅ All queues closed");
}
