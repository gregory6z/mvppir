import { FastifyRequest, FastifyReply } from "fastify"
import { z } from "zod"
import { getRecentCommissions } from "../use-cases/get-recent-commissions"

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
})

/**
 * GET /api/mlm/commissions/recent?limit=10
 *
 * Returns recent commissions for authenticated user.
 */
export async function getRecentCommissionsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id

    // Validate query params
    const { limit } = querySchema.parse(request.query)

    const result = await getRecentCommissions({ userId, limit })

    return reply.status(200).send(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: "Validation error",
        message: error.issues,
      })
    }

    request.log.error(error)
    return reply.status(500).send({
      error: "Internal server error",
      message: "Failed to get recent commissions",
    })
  }
}
