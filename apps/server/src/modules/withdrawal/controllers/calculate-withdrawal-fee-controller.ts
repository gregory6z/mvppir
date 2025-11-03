import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { calculateWithdrawalFee } from "@/modules/withdrawal/use-cases/calculate-withdrawal-fee";

const querySchema = z.object({
  amount: z.string().regex(/^\d+(\.\d+)?$/, "Amount must be a valid number"),
});

/**
 * GET /user/withdrawals/calculate-fee?amount=1000
 * Calculate withdrawal fee for a given amount
 */
export async function calculateWithdrawalFeeController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id; // Middleware requireAuth garante que existe

    const { amount } = querySchema.parse(request.query);

    const feeBreakdown = await calculateWithdrawalFee({
      userId,
      amount: parseFloat(amount),
    });

    return reply.status(200).send(feeBreakdown);
  } catch (error) {
    request.log.error({ error }, "Error calculating withdrawal fee");

    if (error instanceof Error) {
      if (error.message === "User not found") {
        return reply.status(404).send({
          error: "USER_NOT_FOUND",
          message: "User not found",
        });
      }
    }

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to calculate withdrawal fee",
    });
  }
}
