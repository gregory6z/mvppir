import { FastifyRequest, FastifyReply } from "fastify";
import { processMoralisWebhook } from "../use-cases/process-moralis-webhook";
import { validateMoralisSignature } from "@/lib/webhook-signature";

export async function moralisWebhookController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const signature = request.headers["x-signature"] as string;

    if (!signature) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "Missing signature header",
      });
    }

    // Valida assinatura
    const isValid = validateMoralisSignature(request.body, signature);

    if (!isValid) {
      request.log.warn("Invalid Moralis webhook signature");
      return reply.status(401).send({
        error: "Unauthorized",
        message: "Invalid signature",
      });
    }

    // Processa webhook
    const result = await processMoralisWebhook({
      payload: request.body as any,
    });

    request.log.info({ result }, "Moralis webhook processed successfully");

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error(error, "Failed to process Moralis webhook");

    // Retorna 200 mesmo com erro para não fazer Moralis retentar
    // Mas loga o erro para investigação
    return reply.status(200).send({
      message: "Webhook received but processing failed",
    });
  }
}
