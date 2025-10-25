/**
 * Bull Board Plugin
 *
 * Provides a web dashboard for monitoring BullMQ queues.
 * Accessible at: /admin/queues
 *
 * Features:
 * - View all jobs (completed, failed, active, waiting)
 * - Retry failed jobs
 * - View job logs and progress
 * - Clean old jobs
 */

import { FastifyInstance } from "fastify";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { FastifyAdapter } from "@bull-board/fastify";
import {
  dailyCommissionsQueue,
  monthlyMaintenanceQueue,
  gracePeriodRecoveryQueue,
} from "@/lib/queues";

export async function bullBoardPlugin(fastify: FastifyInstance) {
  const serverAdapter = new FastifyAdapter();

  createBullBoard({
    queues: [
      new BullMQAdapter(dailyCommissionsQueue),
      new BullMQAdapter(monthlyMaintenanceQueue),
      new BullMQAdapter(gracePeriodRecoveryQueue),
    ],
    serverAdapter,
  });

  serverAdapter.setBasePath("/admin/queues");

  // Register the Bull Board routes
  await fastify.register(serverAdapter.registerPlugin(), {
    prefix: "/admin/queues",
    basePath: "/admin/queues",
  });

  console.log("✅ Bull Board dashboard available at /admin/queues");
}
