/**
 * Moralis Webhook Worker
 *
 * Processes incoming Moralis webhooks asynchronously.
 * Concurrency: 3 (process up to 3 webhooks in parallel)
 */

import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { QUEUE_NAMES } from "@/lib/queues";
import { processMoralisWebhook } from "../use-cases/process-moralis-webhook";

export interface MoralisWebhookJobData {
  payload: any;
  receivedAt: string;
}

async function processWebhookJob(job: Job<MoralisWebhookJobData>) {
  const { payload, receivedAt } = job.data;

  console.log(`[Webhook Worker] Processing job ${job.id} (received at ${receivedAt})`);

  try {
    const result = await processMoralisWebhook({ payload });

    console.log(`[Webhook Worker] Job ${job.id} completed:`, result);

    return result;
  } catch (error) {
    console.error(`[Webhook Worker] Job ${job.id} failed:`, error);
    throw error; // Re-throw to trigger retry
  }
}

export function startMoralisWebhookWorker() {
  const worker = new Worker<MoralisWebhookJobData>(
    QUEUE_NAMES.WEBHOOK_MORALIS,
    processWebhookJob,
    {
      connection: redis,
      concurrency: 3, // Process up to 3 webhooks in parallel
    }
  );

  worker.on("completed", (job) => {
    console.log(`[Webhook Worker] ✅ Job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`[Webhook Worker] ❌ Job ${job?.id} failed:`, error.message);
  });

  worker.on("error", (error) => {
    console.error("[Webhook Worker] Worker error:", error);
  });

  console.log("✅ Moralis Webhook Worker started (concurrency: 3)");

  return worker;
}
