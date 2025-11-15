import { FastifyInstance } from "fastify";
import { moralisWebhookController } from "./controllers/moralis-webhook-controller";
import { webhookSecurityMiddleware } from "@/middlewares/webhook-security.middleware";

export async function webhookRoutes(fastify: FastifyInstance) {
  // Add content type parser to preserve raw body for signature validation
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    async (req, body: string) => {
      // Store raw body for signature validation
      (req as any).rawBody = body;
      // Parse JSON normally
      return JSON.parse(body);
    }
  );

  // POST /webhooks/moralis - Receive Moralis webhook events
  // Segurança em camadas:
  // 1. webhookSecurityMiddleware - valida User-Agent, rate limiting, IP (TEMPORARIAMENTE DESABILITADO)
  // 2. moralisWebhookController - valida signature (HMAC Keccak256)
  // 3. Webhooks SEM signature válida: retorna 200 mas NÃO processa dados
  //
  // NOTA: Middleware desabilitado temporariamente para permitir criação do Stream
  // Após criar Stream, reabilitar adicionando: preHandler: webhookSecurityMiddleware
  fastify.post("/moralis", moralisWebhookController);

  // GET /webhooks/moralis - Health check for webhook configuration
  fastify.get("/moralis", async (request, reply) => {
    return reply.status(200).send({
      message: "Moralis webhook endpoint is active",
      status: "ok",
    });
  });
}
