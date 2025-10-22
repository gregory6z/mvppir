import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";

/**
 * GET /user/withdrawals
 * Lista saques do usuário autenticado
 */
export async function listWithdrawalsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id;

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        tokenSymbol: true,
        amount: true,
        destinationAddress: true,
        fee: true,
        status: true,
        txHash: true,
        approvedAt: true,
        rejectedReason: true,
        processedAt: true,
        createdAt: true,
      },
    });

    return reply.status(200).send({
      withdrawals,
      total: withdrawals.length,
    });
  } catch (error) {
    request.log.error({ error }, "Error listing withdrawals");

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to list withdrawals",
    });
  }
}
