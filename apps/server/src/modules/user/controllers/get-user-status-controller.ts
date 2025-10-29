import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";
import { checkAccountActivation } from "../use-cases/check-account-activation";

export async function getUserStatusController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        status: true,
      },
    });

    if (!user) {
      return reply.status(404).send({
        error: "User not found",
      });
    }

    // Get activation status
    const activationStatus = await checkAccountActivation({ userId });

    // Calculate progress percentage (0-100)
    const activationProgress = Math.min(
      100,
      (activationStatus.currentTotalUSD / activationStatus.requiredUSD) * 100
    );

    return reply.status(200).send({
      status: user.status, // "INACTIVE" | "ACTIVE" | "BLOCKED"
      totalDepositsUsd: activationStatus.currentTotalUSD.toFixed(2),
      activationThreshold: activationStatus.requiredUSD.toFixed(2),
      activationProgress: Math.round(activationProgress),
    });
  } catch (error: any) {
    request.log.error(error, "Erro ao verificar status do usuário");

    return reply.status(500).send({
      error: "Internal server error",
      message: error.message,
    });
  }
}
