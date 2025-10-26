import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { getBatchCollectHistory } from "@/modules/admin/use-cases/get-batch-collect-history";

const querySchema = z.object({
  limit: z.string().optional().default("20"),
});

/**
 * GET /admin/batch-collect/history
 * Histórico de batch collects executados
 */
export async function getBatchCollectHistoryController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { limit } = querySchema.parse(request.query);
    const limitNum = parseInt(limit, 10);

    const result = await getBatchCollectHistory(limitNum);

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error({ error }, "Error getting batch collect history");

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to get batch collect history",
    });
  }
}
