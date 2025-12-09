// Moralis Webhook Controller - Updated 2024-12-09
import { FastifyRequest, FastifyReply } from "fastify";
import { validateMoralisSignature } from "@/lib/webhook-signature";
import { webhookMoralisQueue } from "@/lib/queues";

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

    // Moralis test requests: allow empty body, test payload, or requests without signature
    // Moralis sends various test payloads when verifying/updating streams
    const isTestRequest =
      !body ||
      Object.keys(body).length === 0 ||
      body.test === true ||
      !signature; // Any request without signature is treated as test

    if (isTestRequest && !signature) {
      request.log.info({
        hasBody: !!body,
        bodyKeys: body ? Object.keys(body) : [],
      }, "Moralis webhook test request (no signature) - returning 200");
      return reply.status(200).send({
        message: "Webhook endpoint is reachable",
        processed: false,
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
      // IMPORTANTE: Retornamos 200 mesmo com assinatura inválida para permitir
      // que o Moralis verifique o endpoint durante criação/atualização de streams.
      // Mas NÃO processamos os dados - apenas logamos e retornamos.
      request.log.warn({ signature, rawBodyLength: rawBody.length }, "Invalid Moralis webhook signature - ignoring payload");
      return reply.status(200).send({
        message: "Webhook received but signature invalid - payload ignored",
        processed: false,
      });
    }

    // Adiciona webhook à fila para processamento assíncrono
    const job = await webhookMoralisQueue.add(
      "process-webhook",
      {
        payload: request.body,
        receivedAt: new Date().toISOString(),
      },
      {
        jobId: `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }
    );

    request.log.info({ jobId: job.id }, "Moralis webhook queued for processing");

    return reply.status(200).send({
      message: "Webhook queued for processing",
      jobId: job.id,
    });
  } catch (error) {
    request.log.error(error, "Failed to process Moralis webhook");

    // Retorna 200 mesmo com erro para não fazer Moralis retentar
    // Mas loga o erro para investigação
    return reply.status(200).send({
      message: "Webhook received but processing failed",
    });
  }
}
