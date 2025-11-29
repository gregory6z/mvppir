import { FastifyInstance, FastifyRequest } from "fastify";
import { moralisWebhookController } from "./controllers/moralis-webhook-controller";
import { webhookSecurityMiddleware } from "@/middlewares/webhook-security.middleware";

export async function webhookRoutes(fastify: FastifyInstance) {
  // Add content type parser to preserve raw body for signature validation
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    async (req: FastifyRequest, body: string) => {
      // Store raw body for signature validation
      (req as any).rawBody = body;
      // Parse JSON normally
      return JSON.parse(body);
    }
  );

  // POST /webhooks/moralis - Receive Moralis webhook events
  // Segurança em camadas:
  // 1. webhookSecurityMiddleware - valida User-Agent, rate limiting, IP
  // 2. moralisWebhookController - valida signature (HMAC Keccak256)
  // 3. Webhooks SEM signature válida: retorna 200 mas NÃO processa dados
  fastify.post("/moralis", {
    preHandler: webhookSecurityMiddleware,
  }, moralisWebhookController);

  // GET /webhooks/moralis - Health check for webhook configuration
  fastify.get("/moralis", async (request, reply) => {
    return reply.status(200).send({
      message: "Moralis webhook endpoint is active",
      status: "ok",
    });
  });
}
