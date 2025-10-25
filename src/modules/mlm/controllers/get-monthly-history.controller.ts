import { FastifyRequest, FastifyReply } from "fastify";
import { getUserMonthlyHistory } from "../use-cases/calculate-monthly-stats";

/**
 * GET /api/mlm/monthly-history
 *
 * Returns monthly statistics history for authenticated user.
 */
export async function getMonthlyHistoryController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id;

    const history = await getUserMonthlyHistory(userId, 12);

    return reply.status(200).send({
      history,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      error: "Internal server error",
      message: "Failed to get monthly history",
    });
  }
}
