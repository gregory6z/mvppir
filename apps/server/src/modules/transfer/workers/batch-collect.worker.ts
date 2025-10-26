/**
 * Batch Collect Worker
 *
 * Processes batch collection of user deposits to Global Wallet.
 * This is a long-running job with progress tracking.
 *
 * Triggered manually by admin via POST /admin/transfers/batch-collect
 */

import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { QUEUE_NAMES } from "@/lib/queues";
import { batchCollectToGlobal } from "@/modules/transfer/use-cases/batch-collect-to-global";

interface BatchCollectJobData {
  adminId: string;
}

/**
 * Process batch collect job
 */
async function processBatchCollect(job: Job<BatchCollectJobData>) {
  const startTime = Date.now();
  const { adminId } = job.data;

  job.log(`Admin ${adminId} initiated batch collect`);
  job.log("Starting batch collection to Global Wallet...");

  try {
    // Call the existing batch collect use case
    const result = await batchCollectToGlobal({ adminId });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    const summary = {
      ...result.summary,
      durationSeconds: duration,
    };

    job.log(`Batch collect completed: ${JSON.stringify(summary)}`);

    // Update progress to 100%
    await job.updateProgress(100);

    return {
      success: true,
      summary,
      details: result.details,
      errors: result.errors,
    };
  } catch (error) {
    job.log(
      `Batch collect failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    throw error;
  }
}

/**
 * Create and start the worker
 */
export function startBatchCollectWorker() {
  const worker = new Worker<BatchCollectJobData>(
    QUEUE_NAMES.BATCH_COLLECT,
    processBatchCollect,
    {
      connection: redis,
      concurrency: 1, // Process one batch collect at a time (blockchain operations)
    }
  );

  worker.on("completed", (job) => {
    console.log(`✅ Batch collect job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Batch collect job ${job?.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("❌ Batch collect worker error:", err);
  });

  worker.on("progress", (job, progress) => {
    console.log(`📊 Batch collect job ${job.id} progress: ${progress}%`);
  });

  console.log("✅ Batch collect worker started");

  return worker;
}
