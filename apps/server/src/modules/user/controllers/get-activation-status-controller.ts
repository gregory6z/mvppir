import { FastifyRequest, FastifyReply } from "fastify";
import { checkAccountActivation } from "../use-cases/check-account-activation";

export async function getActivationStatusController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id;

    const result = await checkAccountActivation({ userId });

    return reply.status(200).send({
      activated: result.activated,
      currentTotalUSD: result.currentTotalUSD,
      requiredUSD: result.requiredUSD,
      missingUSD: result.missingUSD,
      message: result.activated
        ? "Account is active"
        : `Deposit at least $${result.missingUSD.toFixed(2)} USD more to activate your account`,
    });
  } catch (error: any) {
    request.log.error(error, "Erro ao verificar status de ativação");

    if (error.message === "USER_NOT_FOUND") {
      return reply.status(404).send({
        error: "User not found",
      });
    }

    return reply.status(500).send({
      error: "Internal server error",
      message: error.message,
    });
  }
}
