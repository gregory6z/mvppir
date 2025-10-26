import { FastifyRequest, FastifyReply } from "fastify";
import { getBatchCollectPreview } from "@/modules/admin/use-cases/get-batch-collect-preview";

/**
 * GET /admin/batch-collect/preview
 * Preview do que será coletado (antes de executar)
 */
export async function getBatchCollectPreviewController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const result = await getBatchCollectPreview();

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error({ error }, "Error getting batch collect preview");

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to get preview",
    });
  }
}
