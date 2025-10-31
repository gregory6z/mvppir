import { FastifyRequest, FastifyReply } from "fastify"
import { getCommissionsSummary } from "../use-cases/get-commissions-summary"

/**
 * GET /api/mlm/commissions/summary
 *
 * Returns commission aggregations for authenticated user.
 */
export async function getCommissionsSummaryController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id

    const summary = await getCommissionsSummary({ userId })

    return reply.status(200).send(summary)
  } catch (error) {
    request.log.error(error)
    return reply.status(500).send({
      error: "Internal server error",
      message: "Failed to get commissions summary",
    })
  }
}
