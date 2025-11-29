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
  BATCH_COLLECT: "admin-batch-collect",
  WEBHOOK_MORALIS: "webhook-moralis",
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
 * Individual Maintenance Queue
 *
 * Checks if users met monthly requirements and handles downrank flow.
 * Each user has individual 30-day cycles starting from account activation.
 * Runs daily at 00:00 UTC, processes only users with nextMaintenanceCheck <= today.
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
        count: 365, // Keep last 365 daily runs (1 year)
      },
      removeOnFail: false, // Never remove failed jobs (manual review)
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
 * Batch Collect Queue
 *
 * Processes batch collection of user deposits to Global Wallet.
 * Jobs are created manually by admin via POST /admin/transfers/batch-collect.
 * Long-running job with progress tracking.
 */
export const batchCollectQueue = new Queue(QUEUE_NAMES.BATCH_COLLECT, {
  connection,
  defaultJobOptions: {
    attempts: 1, // Don't auto-retry blockchain operations (manual review needed)
    removeOnComplete: {
      age: 604800, // Keep completed for 7 days
      count: 50, // Keep last 50 batch collects
    },
    removeOnFail: false, // Never remove failed jobs (admin needs to review)
  },
});

/**
 * Moralis Webhook Queue
 *
 * Processes incoming Moralis webhooks (deposits) asynchronously.
 * Allows API to respond quickly while processing in background.
 */
export const webhookMoralisQueue = new Queue(QUEUE_NAMES.WEBHOOK_MORALIS, {
  connection,
  defaultJobOptions: {
    attempts: 3, // Retry failed webhooks
    backoff: {
      type: "exponential",
      delay: 5000, // Start with 5 seconds
    },
    removeOnComplete: {
      age: 86400, // Keep completed for 24 hours
      count: 1000, // Keep last 1000 webhooks
    },
    removeOnFail: {
      age: 604800, // Keep failed for 7 days
    },
  },
});

/**
 * Initialize all repeatable jobs (cron schedules)
 * All jobs run on UTC timezone
 */
export async function initializeRepeatingJobs() {
  // Daily commissions at 00:05 UTC
  await dailyCommissionsQueue.add(
    "calculate-daily",
    {},
    {
      repeat: {
        pattern: "5 0 * * *", // Every day at 00:05
        tz: "UTC",
      },
      jobId: "daily-commissions-cron", // Prevent duplicates
    }
  );

  console.log("✅ Daily commissions job scheduled (00:05 UTC)");

  // Individual maintenance cycles (daily check) at 00:00 UTC
  await monthlyMaintenanceQueue.add(
    "check-individual-cycles",
    {},
    {
      repeat: {
        pattern: "0 0 * * *", // Every day at 00:00 (checks individual nextMaintenanceCheck)
        tz: "UTC",
      },
      jobId: "monthly-maintenance-cron",
    }
  );

  console.log("✅ Individual maintenance job scheduled (00:00 UTC daily)");

  // Grace period recovery at 12:00 UTC
  await gracePeriodRecoveryQueue.add(
    "check-recovery",
    {},
    {
      repeat: {
        pattern: "0 12 * * *", // Every day at 12:00
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
  await batchCollectQueue.close();
  await webhookMoralisQueue.close();
  console.log("✅ All queues closed");
}
