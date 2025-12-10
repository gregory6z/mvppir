/**
 * Deposit Worker
 *
 * Processes incoming deposits detected by blockchain WebSocket listener.
 * Concurrency: 3 (process up to 3 deposits in parallel)
 */

import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { QUEUE_NAMES } from "@/lib/queues";
import { processDeposit } from "@/modules/deposit/use-cases/process-deposit";

export interface DepositJobData {
  payload: any;
  receivedAt: string;
}

// Interface do payload do WebSocket listener
interface WebSocketPayload {
  confirmed: boolean;
  chainId: string;
  txHash: string;
  to: string;
  from: string;
  value: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: string;
  block: {
    number: string;
    timestamp: string;
  };
}

async function processDepositJob(job: Job<DepositJobData>) {
  const { payload, receivedAt } = job.data;

  console.log(`[Deposit Worker] Processing job ${job.id} (received at ${receivedAt})`);

  try {
    const depositPayload = payload as WebSocketPayload;

    console.log(`[Deposit Worker] Processing deposit:`, {
      txHash: depositPayload.txHash,
      to: depositPayload.to,
      from: depositPayload.from,
      value: depositPayload.value,
      tokenSymbol: depositPayload.tokenSymbol,
    });

    // Process deposit using business logic
    const result = await processDeposit({ payload: depositPayload });

    console.log(`[Deposit Worker] Job ${job.id} completed. Result:`, result);

    return { processed: 1, result };
  } catch (error) {
    console.error(`[Deposit Worker] Job ${job.id} failed:`, error);
    throw error; // Re-throw to trigger retry
  }
}

export function startDepositWorker() {
  const worker = new Worker<DepositJobData>(
    QUEUE_NAMES.DEPOSITS,
    processDepositJob,
    {
      connection: redis,
      concurrency: 3, // Process up to 3 deposits in parallel
    }
  );

  worker.on("completed", (job) => {
    console.log(`[Deposit Worker] Job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`[Deposit Worker] Job ${job?.id} failed:`, error.message);
  });

  worker.on("error", (error) => {
    console.error("[Deposit Worker] Worker error:", error);
  });

  console.log("Deposit Worker started (concurrency: 3)");

  return worker;
}
