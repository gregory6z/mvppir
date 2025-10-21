import { FastifyRequest, FastifyReply } from "fastify";
import { processMoralisWebhook } from "../use-cases/process-moralis-webhook";
import { keccak256 } from "ethers";

// Valida assinatura do webhook Moralis
// Moralis usa: web3.utils.sha3(JSON.stringify(body) + secret)
// sha3 do web3 = Keccak256
function validateMoralisSignature(payload: any, signature: string): boolean {
  const streamSecret = process.env.MORALIS_STREAM_SECRET;

  if (!streamSecret) {
    throw new Error("MORALIS_STREAM_SECRET not configured");
  }

  // Concatena body + secret e calcula keccak256
  const data = JSON.stringify(payload) + streamSecret;
  const hash = keccak256(Buffer.from(data));

  return hash === signature;
}

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
