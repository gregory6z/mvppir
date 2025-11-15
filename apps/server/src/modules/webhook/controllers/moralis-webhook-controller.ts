import { FastifyRequest, FastifyReply } from "fastify";
import { processMoralisWebhook } from "../use-cases/process-moralis-webhook";
import { validateMoralisSignature } from "@/lib/webhook-signature";

export async function moralisWebhookController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const signature = request.headers["x-signature"] as string;
    const body = request.body as any;

    // Log all webhook requests for debugging
    request.log.info({
      headers: request.headers,
      bodyKeys: body ? Object.keys(body) : [],
      hasSignature: !!signature,
    }, "Moralis webhook request received");

    // Moralis test requests: allow empty body or test payload without signature
    if (!body || Object.keys(body).length === 0 || body.test === true) {
      request.log.info("Moralis webhook test request - returning 200");
      return reply.status(200).send({
        message: "Webhook endpoint is reachable",
      });
    }

    if (!signature) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "Missing signature header",
      });
    }

    // Get raw body for signature validation
    const rawBody = (request as any).rawBody as string;

    if (!rawBody) {
      request.log.error("Raw body not available for signature validation");
      return reply.status(500).send({
        error: "Internal Server Error",
        message: "Raw body not preserved",
      });
    }

    // Valida assinatura usando raw body
    const isValid = validateMoralisSignature(rawBody, signature);

    if (!isValid) {
      request.log.warn({ signature, rawBodyLength: rawBody.length }, "Invalid Moralis webhook signature");
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
