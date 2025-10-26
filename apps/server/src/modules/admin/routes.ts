import { FastifyInstance } from "fastify";
import { requireAdmin } from "@/middlewares/admin.middleware";
import { getGlobalWalletBalanceController } from "@/modules/admin/controllers/get-global-wallet-balance-controller";
import { getBatchCollectPreviewController } from "@/modules/admin/controllers/get-batch-collect-preview-controller";
import { getBatchCollectStatusController } from "@/modules/admin/controllers/get-batch-collect-status-controller";
import { getBatchCollectHistoryController } from "@/modules/admin/controllers/get-batch-collect-history-controller";
import { getMaticStatusController } from "@/modules/admin/controllers/get-matic-status-controller";
import { getMaticRechargeHistoryController } from "@/modules/admin/controllers/get-matic-recharge-history-controller";

/**
 * Rotas admin
 * Todas requerem autenticação de admin
 */
export async function adminRoutes(app: FastifyInstance) {
  // Proteção: todas as rotas requerem permissão de admin
  app.addHook("onRequest", requireAdmin);

  // Global Wallet
  app.get("/global-wallet/balance", getGlobalWalletBalanceController);

  // Batch Collect
  app.get("/batch-collect/preview", getBatchCollectPreviewController);
  app.get("/batch-collect/status/:jobId", getBatchCollectStatusController);
  app.get("/batch-collect/history", getBatchCollectHistoryController);

  // MATIC
  app.get("/matic/status", getMaticStatusController);
  app.get("/matic/recharge-history", getMaticRechargeHistoryController);
}
