import { FastifyRequest, FastifyReply } from "fastify";
import { getMaticStatus } from "@/modules/admin/use-cases/get-matic-status";

/**
 * GET /admin/matic/status
 * Status do MATIC (saldo, estimativas, alertas)
 */
export async function getMaticStatusController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const result = await getMaticStatus();

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error({ error }, "Error getting MATIC status");

    if (error instanceof Error && error.message === "GLOBAL_WALLET_NOT_FOUND") {
      return reply.status(404).send({
        error: "GLOBAL_WALLET_NOT_FOUND",
        message: "Global Wallet not configured",
      });
    }

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to get MATIC status",
    });
  }
}
