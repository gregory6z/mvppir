import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { approveWithdrawal } from "@/modules/withdrawal/use-cases/approve-withdrawal";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

/**
 * POST /admin/withdrawals/:id/approve
 * Admin aprova saque pendente
 */
export async function approveWithdrawalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const adminId = request.user!.id; // Middleware requireAdmin garante que é admin
    const { id: withdrawalId } = paramsSchema.parse(request.params);

    const result = await approveWithdrawal({
      withdrawalId,
      adminId,
    });

    return reply.status(200).send({
      success: true,
      withdrawal: result.withdrawal,
      notificationSent: result.notificationSent,
      message: result.message,
    });
  } catch (error) {
    request.log.error({ error }, "Error approving withdrawal");

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
          message: `Cannot approve withdrawal with status ${error.message.split("_").pop()}`,
        });
      }
    }

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to approve withdrawal",
    });
  }
}
