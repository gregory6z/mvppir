import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { retryWithdrawal } from "@/modules/withdrawal/use-cases/retry-withdrawal";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

/**
 * POST /admin/withdrawals/:id/retry
 * Admin tenta reprocessar saque que falhou (apenas erros recuperáveis)
 */
export async function retryWithdrawalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const adminId = request.user!.id;
    const { id: withdrawalId } = paramsSchema.parse(request.params);

    const result = await retryWithdrawal({
      withdrawalId,
      adminId,
    });

    return reply.status(200).send({
      success: true,
      ...result,
    });
  } catch (error) {
    request.log.error({ error }, "Error retrying withdrawal");

    if (error instanceof Error) {
      if (error.message === "WITHDRAWAL_NOT_FOUND") {
        return reply.status(404).send({
          error: "WITHDRAWAL_NOT_FOUND",
          message: "Withdrawal not found",
        });
      }

      if (error.message.startsWith("CANNOT_RETRY_STATUS")) {
        const status = error.message.split("_").pop();
        return reply.status(400).send({
          error: error.message,
          message: `Cannot retry withdrawal with status ${status}. Only FAILED withdrawals can be retried.`,
        });
      }
    }

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to retry withdrawal",
    });
  }
}
