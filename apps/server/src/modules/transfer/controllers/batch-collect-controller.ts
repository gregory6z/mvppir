import { FastifyRequest, FastifyReply } from "fastify";
import { batchCollectQueue } from "@/lib/queues";

console.log("📦 [BatchCollect] Controller module loaded");

/**
 * DELETE /admin/batch-collect/clear
 * Limpa todos os jobs antigos (failed, active, waiting) do batch collect
 */
export async function clearBatchCollectJobsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    console.log("🧹 [BatchCollect] Clearing old jobs...");

    // Pega jobs em diferentes estados
    const activeJobs = await batchCollectQueue.getActive();
    const failedJobs = await batchCollectQueue.getFailed();
    const waitingJobs = await batchCollectQueue.getWaiting();

    let removedCount = 0;

    // Remove jobs ativos (presos)
    for (const job of activeJobs) {
      await job.remove();
      removedCount++;
      console.log(`  🗑️ Removed active job ${job.id}`);
    }

    // Remove jobs falhos
    for (const job of failedJobs) {
      await job.remove();
      removedCount++;
      console.log(`  🗑️ Removed failed job ${job.id}`);
    }

    // Remove jobs em espera
    for (const job of waitingJobs) {
      await job.remove();
      removedCount++;
      console.log(`  🗑️ Removed waiting job ${job.id}`);
    }

    console.log(`✅ [BatchCollect] Cleared ${removedCount} jobs`);

    return reply.status(200).send({
      success: true,
      removedCount,
      message: `Cleared ${removedCount} batch collect jobs`,
    });
  } catch (error) {
    request.log.error({ error }, "Error clearing batch collect jobs");

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to clear batch collect jobs",
    });
  }
}

/**
 * POST /admin/transfers/batch-collect
 * Admin executa transferência em lote de todos os endereços para Global Wallet
 *
 * Cria um job no Bull Queue para processamento em background.
 * Retorna jobId para tracking via GET /admin/batch-collect/status/:jobId
 *
 * Processo em 3 fases (executado pelo worker):
 * 1. Distribui MATIC (Global → Endereços usuários)
 * 2. Transfere tokens (Endereços → Global)
 * 3. Recupera MATIC restante (Endereços → Global)
 */
export async function batchCollectController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  console.log(`🚀 [BatchCollect] Controller called!`);
  console.log(`🚀 [BatchCollect] Headers: ${JSON.stringify(request.headers)}`);
  console.log(`🚀 [BatchCollect] Body: ${JSON.stringify(request.body)}`);
  console.log(`🚀 [BatchCollect] User: ${JSON.stringify(request.user)}`);

  try {
    const adminId = request.user!.id;

    console.log(`🔐 Admin ${adminId} criando job de batch collect`);

    // Cria job no Bull Queue
    const job = await batchCollectQueue.add(
      "batch-collect-manual",
      { adminId },
      {
        removeOnComplete: false, // Manter job completo para histórico
        removeOnFail: false, // Manter job falho para análise
      }
    );

    console.log(`✅ Job ${job.id} criado com sucesso`);

    return reply.status(202).send({
      success: true,
      jobId: job.id,
      message: "Batch collect job created. Use jobId to track progress.",
    });
  } catch (error) {
    request.log.error({ error }, "Error creating batch collect job");

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to create batch collect job",
    });
  }
}
