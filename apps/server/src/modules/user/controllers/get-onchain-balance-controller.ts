import { FastifyRequest, FastifyReply } from "fastify";
import { getOnChainBalance } from "../use-cases/get-onchain-balance";

export async function getOnChainBalanceController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id;

    const result = await getOnChainBalance({ userId });

    if (!result.success) {
      return reply.status(404).send({
        error: "Not found",
        message: result.error,
      });
    }

    return reply.status(200).send(result.data);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      error: "Internal server error",
      message: "Failed to get on-chain balance",
    });
  }
}
