import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { batchCollectQueue } from "@/lib/queues";

const paramsSchema = z.object({
  jobId: z.string(),
});

/**
 * GET /admin/batch-collect/status/:jobId
 * Status de um job de batch collect em execução
 *
 * Retorna estado atual do job: waiting, active, completed, failed
 * Inclui progresso em tempo real durante execução
 */
export async function getBatchCollectStatusController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { jobId } = paramsSchema.parse(request.params);

    // Busca job do Bull Queue
    const job = await batchCollectQueue.getJob(jobId);

    if (!job) {
      return reply.status(404).send({
        error: "JOB_NOT_FOUND",
        message: `Batch collect job ${jobId} not found`,
      });
    }

    // Pega estado do job
    const state = await job.getState();
    const progress = job.progress;
    const returnvalue = job.returnvalue;
    const failedReason = job.failedReason;

    // Formata resposta baseada no estado
    if (state === "completed") {
      return reply.status(200).send({
        jobId: job.id,
        status: "COMPLETED",
        progress: 100,
        result: returnvalue,
        completedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
      });
    }

    if (state === "failed") {
      return reply.status(200).send({
        jobId: job.id,
        status: "FAILED",
        progress: progress || 0,
        error: failedReason || "Unknown error",
        failedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
      });
    }

    if (state === "active") {
      return reply.status(200).send({
        jobId: job.id,
        status: "PROCESSING",
        progress: progress || 0,
        startedAt: job.processedOn ? new Date(job.processedOn).toISOString() : null,
      });
    }

    // waiting, delayed, etc
    return reply.status(200).send({
      jobId: job.id,
      status: "WAITING",
      progress: 0,
      createdAt: new Date(job.timestamp).toISOString(),
    });
  } catch (error) {
    request.log.error({ error }, "Error getting batch collect status");

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to get batch collect status",
    });
  }
}
