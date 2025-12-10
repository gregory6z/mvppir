import { FastifyInstance } from "fastify";
import { requireAdmin } from "@/middlewares/admin.middleware";
import { batchCollectController } from "@/modules/transfer/controllers/batch-collect-controller";

/**
 * Rotas de transferência (admin apenas)
 */
export async function transferRoutes(app: FastifyInstance) {
  // Todas as rotas de transfer requerem permissão de admin
  app.addHook("onRequest", requireAdmin);

  // Executar batch collect (transferência em lote para Global Wallet)
  // Nota: Este endpoint não requer body, mas aceita JSON vazio para compatibilidade
  app.post("/batch-collect", {
    schema: {
      body: {
        type: "object",
        additionalProperties: false,
      },
    },
  }, batchCollectController);
}
