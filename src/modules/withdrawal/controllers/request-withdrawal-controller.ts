import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";
import { requestWithdrawal } from "@/modules/withdrawal/use-cases/request-withdrawal";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  tokenSymbol: z.string().min(1),
  amount: z.string().min(1), // String para evitar perda de precisão
  destinationAddress: z.string().startsWith("0x").length(42),
});

/**
 * POST /user/withdrawals/request
 * Usuário solicita saque
 */
export async function requestWithdrawalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id; // Middleware requireAuth garante que existe

    const { tokenSymbol, amount, destinationAddress } = bodySchema.parse(
      request.body
    );

    // Busca tokenAddress do Balance (se existir)
    const balance = await prisma.balance.findUnique({
      where: {
        userId_tokenSymbol: { userId, tokenSymbol },
      },
      select: { tokenAddress: true },
    });

    if (!balance) {
      return reply.status(400).send({
        error: "NO_BALANCE_FOR_TOKEN",
        message: `You don't have any ${tokenSymbol} balance`,
      });
    }

    const result = await requestWithdrawal({
      userId,
      tokenSymbol,
      tokenAddress: balance.tokenAddress,
      amount: new Decimal(amount),
      destinationAddress,
    });

    return reply.status(201).send({
      success: true,
      withdrawal: result.withdrawal,
      message: result.message,
    });
  } catch (error) {
    request.log.error({ error }, "Error requesting withdrawal");

    if (error instanceof Error) {
      // Erros de negócio
      if (error.message.startsWith("INSUFFICIENT_BALANCE")) {
        return reply.status(400).send({
          error: "INSUFFICIENT_BALANCE",
          message: "Insufficient balance for withdrawal",
        });
      }

      if (error.message.startsWith("MINIMUM_WITHDRAWAL")) {
        return reply.status(400).send({
          error: error.message,
          message: `Minimum withdrawal is $${error.message.split("_").pop()} USD`,
        });
      }

      if (error.message === "WITHDRAWAL_ALREADY_PENDING") {
        return reply.status(400).send({
          error: "WITHDRAWAL_ALREADY_PENDING",
          message: "You already have a pending withdrawal. Please wait for approval.",
        });
      }

      if (error.message === "INVALID_DESTINATION_ADDRESS") {
        return reply.status(400).send({
          error: "INVALID_DESTINATION_ADDRESS",
          message: "Invalid Polygon address format",
        });
      }
    }

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to request withdrawal",
    });
  }
}
