import { FastifyRequest, FastifyReply } from "fastify";
import { getWithdrawalLimits } from "@/modules/withdrawal/use-cases/get-withdrawal-limits";

/**
 * GET /user/withdrawals/limits
 * Get withdrawal limits and validation info for current user
 */
export async function getWithdrawalLimitsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id;

    const limits = await getWithdrawalLimits({ userId });

    return reply.status(200).send(limits);
  } catch (error) {
    request.log.error({ error }, "Error getting withdrawal limits");

    if (error instanceof Error && error.message === "User not found") {
      return reply.status(404).send({
        error: "USER_NOT_FOUND",
        message: "User not found",
      });
    }

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to get withdrawal limits",
    });
  }
}
