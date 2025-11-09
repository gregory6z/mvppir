import { FastifyRequest, FastifyReply } from "fastify";
import { redis } from "@/lib/redis";
import {
  dailyCommissionsQueue,
  monthlyMaintenanceQueue,
  gracePeriodRecoveryQueue,
  batchCollectQueue,
} from "@/lib/queues";

/**
 * GET /admin/workers/status
 *
 * Retorna status de todos os workers e do Redis
 */
export async function getWorkersStatus(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // 1. Check Redis connection
    const redisStatus = redis.status;
    const redisPing = await redis.ping().catch(() => "FAILED");

    // 2. Get queue stats
    const [dailyJobs, monthlyJobs, graceJobs, batchJobs] = await Promise.all([
      dailyCommissionsQueue.getJobCounts(),
      monthlyMaintenanceQueue.getJobCounts(),
      gracePeriodRecoveryQueue.getJobCounts(),
      batchCollectQueue.getJobCounts(),
    ]);

    // 3. Get repeatable jobs
    const [dailyRepeatable, monthlyRepeatable, graceRepeatable] =
      await Promise.all([
        dailyCommissionsQueue.getRepeatableJobs(),
        monthlyMaintenanceQueue.getRepeatableJobs(),
        gracePeriodRecoveryQueue.getRepeatableJobs(),
      ]);

    return reply.send({
      redis: {
        status: redisStatus,
        ping: redisPing,
        connected: redisStatus === "ready" && redisPing === "PONG",
      },
      queues: {
        dailyCommissions: {
          name: "Daily Commissions",
          schedule: "Every day at 00:05 UTC",
          jobs: dailyJobs,
          repeatableJobs: dailyRepeatable.length,
          isScheduled: dailyRepeatable.length > 0,
        },
        monthlyMaintenance: {
          name: "Monthly Maintenance",
          schedule: "1st of month at 00:00 UTC",
          jobs: monthlyJobs,
          repeatableJobs: monthlyRepeatable.length,
          isScheduled: monthlyRepeatable.length > 0,
        },
        gracePeriodRecovery: {
          name: "Grace Period Recovery",
          schedule: "Every day at 12:00 UTC",
          jobs: graceJobs,
          repeatableJobs: graceRepeatable.length,
          isScheduled: graceRepeatable.length > 0,
        },
        batchCollect: {
          name: "Batch Collect (Manual)",
          schedule: "Triggered manually by admin",
          jobs: batchJobs,
          repeatableJobs: 0,
          isScheduled: false,
        },
      },
      workersRunning: redisStatus === "ready" && redisPing === "PONG",
    });
  } catch (error: any) {
    request.log.error({ error }, "Failed to get workers status");
    return reply.status(500).send({
      error: "WORKERS_STATUS_ERROR",
      message: error.message,
      redis: {
        status: redis.status,
        connected: false,
      },
    });
  }
}
