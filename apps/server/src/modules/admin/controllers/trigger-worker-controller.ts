/**
 * Trigger Worker Controller
 *
 * Manually trigger a specific worker for testing/debugging purposes.
 */

import { FastifyReply, FastifyRequest } from "fastify";
import { Queue, QueueEvents } from "bullmq";
import { redis } from "@/lib/redis";
import { QUEUE_NAMES } from "@/lib/queues";

interface TriggerWorkerParams {
  workerName: string;
}

const WORKER_QUEUES: Record<string, string> = {
  "daily-commissions": QUEUE_NAMES.DAILY_COMMISSIONS,
  "monthly-maintenance": QUEUE_NAMES.MONTHLY_MAINTENANCE,
  "grace-period-recovery": QUEUE_NAMES.GRACE_PERIOD_RECOVERY,
  "batch-collect": QUEUE_NAMES.BATCH_COLLECT,
};

export async function triggerWorkerController(
  request: FastifyRequest<{ Params: TriggerWorkerParams }>,
  reply: FastifyReply
) {
  try {
    const { workerName } = request.params;

    // Validate worker name
    const queueName = WORKER_QUEUES[workerName];
    if (!queueName) {
      return reply.status(400).send({
        error: "Invalid worker name",
        availableWorkers: Object.keys(WORKER_QUEUES),
      });
    }

    // Create queue instance
    const queue = new Queue(queueName, {
      connection: redis,
    });

    // Add manual job
    const job = await queue.add(
      `manual-trigger-${Date.now()}`,
      {},
      {
        removeOnComplete: false, // Keep for inspection
        removeOnFail: false,
      }
    );

    // Create QueueEvents to wait for completion
    const queueEvents = new QueueEvents(queueName, {
      connection: redis,
    });

    // Wait for completion (with timeout)
    const result = await Promise.race([
      job.waitUntilFinished(queueEvents),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout after 60s")), 60000)
      ),
    ]);

    await queueEvents.close();
    await queue.close();

    return reply.status(200).send({
      success: true,
      workerName,
      jobId: job.id,
      result,
    });
  } catch (error) {
    request.log.error({ error }, "Error triggering worker");
    return reply.status(500).send({
      error: "Failed to trigger worker",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
