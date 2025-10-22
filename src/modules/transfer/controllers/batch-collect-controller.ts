import { FastifyRequest, FastifyReply } from "fastify";
import { batchCollectToGlobal } from "@/modules/transfer/use-cases/batch-collect-to-global";

/**
 * POST /admin/transfers/batch-collect
 * Admin executa transferência em lote de todos os endereços para Global Wallet
 *
 * Processo em 3 fases:
 * 1. Distribui MATIC (Global → Endereços usuários)
 * 2. Transfere tokens (Endereços → Global)
 * 3. Recupera MATIC restante (Endereços → Global)
 */
export async function batchCollectController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const adminId = request.user!.id;

    console.log(`🔐 Admin ${adminId} iniciou batch collect`);

    const result = await batchCollectToGlobal({ adminId });

    return reply.status(200).send({
      success: true,
      ...result,
    });
  } catch (error) {
    request.log.error({ error }, "Error in batch collect");

    if (error instanceof Error) {
      // Erros conhecidos
      if (error.message.startsWith("INSUFFICIENT_GLOBAL_MATIC")) {
        return reply.status(400).send({
          error: "INSUFFICIENT_GLOBAL_MATIC",
          message: error.message,
        });
      }

      if (error.message === "GLOBAL_WALLET_NOT_FOUND") {
        return reply.status(500).send({
          error: "GLOBAL_WALLET_NOT_FOUND",
          message: "Global Wallet não encontrada. Execute o setup primeiro.",
        });
      }
    }

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to execute batch collect",
    });
  }
}
