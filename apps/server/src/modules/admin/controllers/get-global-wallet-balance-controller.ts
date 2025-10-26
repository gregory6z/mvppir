import { FastifyRequest, FastifyReply } from "fastify";
import { getGlobalWalletBalance } from "@/modules/admin/use-cases/get-global-wallet-balance";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

/**
 * GET /admin/global-wallet/balance?page=1&limit=10
 * Retorna saldos de todos os tokens na Global Wallet com paginação
 */
export async function getGlobalWalletBalanceController(
  request: FastifyRequest<{
    Querystring: { page?: string; limit?: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { page, limit } = querySchema.parse(request.query);

    const result = await getGlobalWalletBalance({ page, limit });

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error({ error }, "Error getting global wallet balance");

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Invalid query parameters",
        details: error.issues,
      });
    }

    if (error instanceof Error && error.message === "GLOBAL_WALLET_NOT_FOUND") {
      return reply.status(404).send({
        error: "GLOBAL_WALLET_NOT_FOUND",
        message: "Global Wallet not configured",
      });
    }

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to get global wallet balance",
    });
  }
}
