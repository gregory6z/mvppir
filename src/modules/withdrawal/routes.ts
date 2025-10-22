import { FastifyInstance } from "fastify";
import { requireAuth } from "@/middlewares/auth.middleware";
import { requireAdmin } from "@/middlewares/admin.middleware";
import { requestWithdrawalController } from "@/modules/withdrawal/controllers/request-withdrawal-controller";
import { listWithdrawalsController } from "@/modules/withdrawal/controllers/list-withdrawals-controller";
import { approveWithdrawalController } from "@/modules/withdrawal/controllers/approve-withdrawal-controller";
import { rejectWithdrawalController } from "@/modules/withdrawal/controllers/reject-withdrawal-controller";
import { listAllWithdrawalsController } from "@/modules/withdrawal/controllers/list-all-withdrawals-controller";

/**
 * Rotas de saque (usuário)
 */
export async function userWithdrawalRoutes(app: FastifyInstance) {
  // Todas as rotas de usuário requerem autenticação
  app.addHook("onRequest", requireAuth);

  // Solicitar saque
  app.post("/request", requestWithdrawalController);

  // Listar meus saques
  app.get("/", listWithdrawalsController);
}

/**
 * Rotas de saque (admin)
 */
export async function adminWithdrawalRoutes(app: FastifyInstance) {
  // Todas as rotas de admin requerem permissão de admin
  app.addHook("onRequest", requireAdmin);

  // Listar todos os saques (com filtro)
  app.get("/", listAllWithdrawalsController);

  // Aprovar saque
  app.post("/:id/approve", approveWithdrawalController);

  // Rejeitar saque
  app.post("/:id/reject", rejectWithdrawalController);
}
