import { FastifyRequest, FastifyReply } from "fastify";
import { getGlobalWalletBalance } from "@/modules/admin/use-cases/get-global-wallet-balance";

/**
 * GET /admin/global-wallet/balance
 * Retorna saldos de todos os tokens na Global Wallet
 */
export async function getGlobalWalletBalanceController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const result = await getGlobalWalletBalance();

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error({ error }, "Error getting global wallet balance");

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
