import { FastifyInstance } from "fastify";
import { moralisWebhookController } from "./controllers/moralis-webhook-controller";

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
  // Nota: Esta rota NÃO tem autenticação (é chamada pelo Moralis)
  // A autenticação é feita via signature validation
  fastify.post("/moralis", moralisWebhookController);

  // GET /webhooks/moralis - Health check for webhook configuration
  fastify.get("/moralis", async (request, reply) => {
    return reply.status(200).send({
      message: "Moralis webhook endpoint is active",
      status: "ok",
    });
  });
}
