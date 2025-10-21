import { FastifyRequest, FastifyReply } from "fastify";
import { getUserTransactions } from "../use-cases/get-user-transactions";
import { z } from "zod";

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export async function getTransactionsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id;
    const { limit, offset } = querySchema.parse(request.query);

    const result = await getUserTransactions({ userId, limit, offset });

    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: "Validation error",
        details: error.issues,
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      error: "Internal server error",
      message: "Failed to get user transactions",
    });
  }
}
