import { FastifyRequest, FastifyReply } from "fastify";
import { getUserAccount } from "../use-cases/get-user-account";

export async function getAccountController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id;

    const account = await getUserAccount({ userId });

    return reply.status(200).send(account);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      error: "Internal server error",
      message: "Failed to get user account",
    });
  }
}
