import { FastifyInstance } from "fastify";
import { requireAdmin } from "@/middlewares/admin.middleware";
import { batchCollectController } from "@/modules/transfer/controllers/batch-collect-controller";

/**
 * Rotas de transferência (admin apenas)
 */
export async function transferRoutes(app: FastifyInstance) {
  // Todas as rotas de transfer requerem permissão de admin
  app.addHook("onRequest", requireAdmin);

  // Content type parser personalizado para aceitar JSON vazio
  // Fastify rejeita Content-Type: application/json com body vazio por padrão
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (req, body, done) => {
      try {
        // Se body vazio, retorna objeto vazio
        const parsed = body === "" ? {} : JSON.parse(body as string);
        done(null, parsed);
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  );

  // Executar batch collect (transferência em lote para Global Wallet)
  app.post("/batch-collect", batchCollectController);
}
