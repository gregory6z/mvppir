import { FastifyInstance } from "fastify";
import { moralisWebhookController } from "./controllers/moralis-webhook-controller";

export async function webhookRoutes(fastify: FastifyInstance) {
  // POST /webhooks/moralis - Receive Moralis webhook events
  // Nota: Esta rota NÃO tem autenticação (é chamada pelo Moralis)
  // A autenticação é feita via signature validation
  fastify.post("/moralis", moralisWebhookController);
}
