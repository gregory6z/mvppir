import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { rejectWithdrawal } from "@/modules/withdrawal/use-cases/reject-withdrawal";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const bodySchema = z.object({
  reason: z.string().min(1).max(500),
});

/**
 * POST /admin/withdrawals/:id/reject
 * Admin rejeita saque pendente
 */
export async function rejectWithdrawalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const adminId = request.user!.id;
    const { id: withdrawalId } = paramsSchema.parse(request.params);
    const { reason } = bodySchema.parse(request.body);

    const result = await rejectWithdrawal({
      withdrawalId,
      adminId,
      reason,
    });

    return reply.status(200).send({
      success: true,
      withdrawal: result.withdrawal,
      notificationSent: result.notificationSent,
      message: result.message,
    });
  } catch (error) {
    request.log.error({ error }, "Error rejecting withdrawal");

    if (error instanceof Error) {
      if (error.message === "WITHDRAWAL_NOT_FOUND") {
        return reply.status(404).send({
          error: "WITHDRAWAL_NOT_FOUND",
          message: "Withdrawal not found",
        });
      }

      if (error.message.startsWith("INVALID_STATUS")) {
        return reply.status(400).send({
          error: error.message,
          message: `Cannot reject withdrawal with status ${error.message.split("_").pop()}`,
        });
      }
    }

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to reject withdrawal",
    });
  }
}
