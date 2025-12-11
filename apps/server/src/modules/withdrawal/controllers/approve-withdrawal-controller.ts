import { FastifyRequest, FastifyReply } from "fastify";
import { z, ZodError } from "zod";
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
    console.log(`📥 [ApproveWithdrawal] Request params:`, request.params);

    const adminId = request.user!.id; // Middleware requireAdmin garante que é admin
    const { id: withdrawalId } = paramsSchema.parse(request.params);

    console.log(`📥 [ApproveWithdrawal] Processing withdrawal ${withdrawalId} by admin ${adminId}`);

    const result = await approveWithdrawal({
      withdrawalId,
      adminId,
    });

    console.log(`✅ [ApproveWithdrawal] Success for withdrawal ${withdrawalId}`);

    return reply.status(200).send({
      success: true,
      withdrawal: result.withdrawal,
      notificationSent: result.notificationSent,
      message: result.message,
    });
  } catch (error) {
    request.log.error({ error }, "Error approving withdrawal");

    // Erro de validação do Zod (parâmetros inválidos)
    if (error instanceof ZodError) {
      console.log(`❌ [ApproveWithdrawal] Validation error:`, error.issues);
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Invalid withdrawal ID format",
        details: error.issues,
      });
    }

    if (error instanceof Error) {
      if (error.message === "WITHDRAWAL_NOT_FOUND") {
        return reply.status(404).send({
          error: "WITHDRAWAL_NOT_FOUND",
          message: "Withdrawal not found",
        });
      }

      if (error.message.startsWith("INVALID_STATUS")) {
        const currentStatus = error.message.replace("INVALID_STATUS_", "");
        console.log(`❌ [ApproveWithdrawal] Invalid status: ${currentStatus}`);
        return reply.status(400).send({
          error: error.message,
          message: `Cannot approve withdrawal with status ${currentStatus}. Only PENDING_APPROVAL withdrawals can be approved.`,
        });
      }
    }

    console.log(`❌ [ApproveWithdrawal] Internal error:`, error);
    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to approve withdrawal",
    });
  }
}
