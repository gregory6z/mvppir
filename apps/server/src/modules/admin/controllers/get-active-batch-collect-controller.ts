import { FastifyRequest, FastifyReply } from "fastify";
import { batchCollectQueue } from "@/lib/queues";

/**
 * GET /admin/batch-collect/active
 * Retorna job de batch collect ativo (se houver)
 *
 * Usado para recuperar o estado do job quando usuário navega
 * de volta para a página de batch collect
 */
export async function getActiveBatchCollectController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Busca jobs ativos (em execução)
    const activeJobs = await batchCollectQueue.getActive();

    // Busca jobs aguardando (na fila)
    const waitingJobs = await batchCollectQueue.getWaiting();

    // Retorna o primeiro job ativo ou aguardando
    const activeJob = activeJobs[0] || waitingJobs[0];

    if (!activeJob) {
      return reply.status(200).send({
        hasActiveJob: false,
        job: null,
      });
    }

    const state = await activeJob.getState();
    const progress = activeJob.progress;

    const progressData = typeof progress === 'object' && progress !== null
      ? progress as { completed: number; total: number; failed: number }
      : { completed: 0, total: 0, failed: 0 };

    return reply.status(200).send({
      hasActiveJob: true,
      job: {
        jobId: activeJob.id,
        status: state === "active" ? "IN_PROGRESS" : "PENDING",
        progress: progressData,
        startedAt: activeJob.processedOn ? new Date(activeJob.processedOn).toISOString() : null,
        createdAt: new Date(activeJob.timestamp).toISOString(),
      },
    });
  } catch (error) {
    request.log.error({ error }, "Error getting active batch collect job");

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to get active batch collect job",
    });
  }
}
