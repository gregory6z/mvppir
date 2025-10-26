import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { getMaticRechargeHistory } from "@/modules/admin/use-cases/get-matic-recharge-history";

const querySchema = z.object({
  limit: z.string().optional().default("20"),
});

/**
 * GET /admin/matic/recharge-history
 * Histórico de recargas de MATIC na Global Wallet
 */
export async function getMaticRechargeHistoryController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { limit } = querySchema.parse(request.query);
    const limitNum = parseInt(limit, 10);

    const result = await getMaticRechargeHistory(limitNum);

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error({ error }, "Error getting MATIC recharge history");

    if (error instanceof Error && error.message === "GLOBAL_WALLET_NOT_FOUND") {
      return reply.status(404).send({
        error: "GLOBAL_WALLET_NOT_FOUND",
        message: "Global Wallet not configured",
      });
    }

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to get recharge history",
    });
  }
}
