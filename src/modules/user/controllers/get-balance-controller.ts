import { FastifyRequest, FastifyReply } from "fastify";
import { getUserBalance } from "../use-cases/get-user-balance";

export async function getBalanceController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id;

    const balance = await getUserBalance({ userId });

    return reply.status(200).send(balance);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      error: "Internal server error",
      message: "Failed to get user balance",
    });
  }
}
