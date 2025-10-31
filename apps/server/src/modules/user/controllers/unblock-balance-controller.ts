import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { unblockBalance } from "@/modules/mlm/use-cases/unblock-balance";

const bodySchema = z.object({
  amount: z.number().positive(),
});

/**
 * POST /user/balance/unblock
 * Manually unblock USDC balance (moves from blockedBalance → availableBalance)
 *
 * Use cases:
 * - User wants to unlock balance for withdrawal
 * - User wants to reduce rank deliberately
 */
export async function unblockBalanceController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id; // Middleware requireAuth garante que existe

    const { amount } = bodySchema.parse(request.body);

    const result = await unblockBalance({
      userId,
      amount,
    });

    return reply.status(200).send({
      success: result.success,
      amountUnblocked: result.amountUnblocked,
      blockedBalance: result.blockedBalance,
      availableBalance: result.availableBalance,
      previousRank: result.previousRank,
      newRank: result.newRank,
      rankChanged: result.rankChanged,
      message: result.message,
    });
  } catch (error) {
    request.log.error({ error }, "Error unblocking balance");

    if (error instanceof Error) {
      if (error.message === "User not found") {
        return reply.status(404).send({
          error: "USER_NOT_FOUND",
          message: "User not found",
        });
      }

      if (error.message.includes("Insufficient blocked balance")) {
        return reply.status(400).send({
          error: "INSUFFICIENT_BLOCKED_BALANCE",
          message: error.message,
        });
      }

      if (error.message.includes("Amount must be greater than 0")) {
        return reply.status(400).send({
          error: "INVALID_AMOUNT",
          message: "Amount must be greater than 0",
        });
      }
    }

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to unblock balance",
    });
  }
}
