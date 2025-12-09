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

// Interface do payload real do Moralis
interface MoralisRawPayload {
  confirmed: boolean;
  chainId: string;
  streamId?: string;
  tag?: string;
  retries?: number;
  block: {
    number: string;
    timestamp: string;
    hash: string;
  };
  // ERC20 transfers (USDC, USDT, etc.)
  erc20Transfers?: Array<{
    transactionHash: string;
    from: string;
    to: string;
    value: string;
    tokenAddress: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimals: string;
  }>;
  // Native transactions (MATIC)
  txs?: Array<{
    hash: string;
    from: string;
    to: string;
    value: string;
  }>;
  logs?: any[];
  txsInternal?: any[];
  erc20Approvals?: any[];
  nftApprovals?: any[];
  nftTransfers?: any[];
}

// Interface esperada pelo processMoralisWebhook
interface ProcessablePayload {
  confirmed: boolean;
  chainId: string;
  txHash: string;
  to: string;
  from: string;
  value: string;
  tokenAddress?: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimals?: string;
  block: {
    number: string;
    timestamp: string;
  };
}

async function processWebhookJob(job: Job<MoralisWebhookJobData>) {
  const { payload: rawPayload, receivedAt } = job.data;

  console.log(`[Webhook Worker] Processing job ${job.id} (received at ${receivedAt})`);
  console.log(`[Webhook Worker] Raw payload keys:`, Object.keys(rawPayload));

  try {
    const moralisPayload = rawPayload as MoralisRawPayload;

    // Log para debug
    console.log(`[Webhook Worker] Payload details:`, {
      confirmed: moralisPayload.confirmed,
      chainId: moralisPayload.chainId,
      erc20TransfersCount: moralisPayload.erc20Transfers?.length || 0,
      txsCount: moralisPayload.txs?.length || 0,
      blockNumber: moralisPayload.block?.number,
    });

    const results: any[] = [];

    // 1. Processa ERC20 transfers (USDC, USDT, etc.)
    if (moralisPayload.erc20Transfers && moralisPayload.erc20Transfers.length > 0) {
      console.log(`[Webhook Worker] Processing ${moralisPayload.erc20Transfers.length} ERC20 transfers`);

      for (const transfer of moralisPayload.erc20Transfers) {
        const processablePayload: ProcessablePayload = {
          confirmed: moralisPayload.confirmed,
          chainId: moralisPayload.chainId,
          txHash: transfer.transactionHash,
          to: transfer.to,
          from: transfer.from,
          value: transfer.value,
          tokenAddress: transfer.tokenAddress,
          tokenName: transfer.tokenName,
          tokenSymbol: transfer.tokenSymbol,
          tokenDecimals: transfer.tokenDecimals,
          block: moralisPayload.block,
        };

        console.log(`[Webhook Worker] Processing ERC20 transfer:`, {
          txHash: transfer.transactionHash,
          to: transfer.to,
          from: transfer.from,
          value: transfer.value,
          tokenSymbol: transfer.tokenSymbol,
        });

        try {
          const result = await processMoralisWebhook({ payload: processablePayload });
          results.push({ type: "erc20", txHash: transfer.transactionHash, result });
        } catch (error: any) {
          console.error(`[Webhook Worker] Error processing ERC20 transfer ${transfer.transactionHash}:`, error.message);
          results.push({ type: "erc20", txHash: transfer.transactionHash, error: error.message });
        }
      }
    }

    // 2. Processa transações nativas (MATIC)
    if (moralisPayload.txs && moralisPayload.txs.length > 0) {
      console.log(`[Webhook Worker] Processing ${moralisPayload.txs.length} native transactions`);

      for (const tx of moralisPayload.txs) {
        // Ignora transações com valor 0 (apenas gas)
        if (!tx.value || tx.value === "0") {
          console.log(`[Webhook Worker] Skipping zero-value tx: ${tx.hash}`);
          continue;
        }

        const processablePayload: ProcessablePayload = {
          confirmed: moralisPayload.confirmed,
          chainId: moralisPayload.chainId,
          txHash: tx.hash,
          to: tx.to,
          from: tx.from,
          value: tx.value,
          // MATIC não tem tokenAddress (é nativo)
          tokenSymbol: "MATIC",
          tokenDecimals: "18",
          block: moralisPayload.block,
        };

        console.log(`[Webhook Worker] Processing native tx:`, {
          txHash: tx.hash,
          to: tx.to,
          from: tx.from,
          value: tx.value,
        });

        try {
          const result = await processMoralisWebhook({ payload: processablePayload });
          results.push({ type: "native", txHash: tx.hash, result });
        } catch (error: any) {
          console.error(`[Webhook Worker] Error processing native tx ${tx.hash}:`, error.message);
          results.push({ type: "native", txHash: tx.hash, error: error.message });
        }
      }
    }

    // 3. Se não houver transfers nem txs, pode ser payload de teste ou vazio
    if (results.length === 0) {
      console.log(`[Webhook Worker] No transfers or transactions to process in this webhook`);
      return { message: "No transfers to process", jobId: job.id };
    }

    console.log(`[Webhook Worker] Job ${job.id} completed. Processed ${results.length} transfers.`);

    return { processed: results.length, results };
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
