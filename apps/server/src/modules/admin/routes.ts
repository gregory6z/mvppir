import { FastifyInstance } from "fastify";
import { requireAdmin } from "@/middlewares/admin.middleware";
import { getGlobalWalletBalanceController } from "@/modules/admin/controllers/get-global-wallet-balance-controller";
import { getBatchCollectPreviewController } from "@/modules/admin/controllers/get-batch-collect-preview-controller";
import { getBatchCollectStatusController } from "@/modules/admin/controllers/get-batch-collect-status-controller";
import { getBatchCollectHistoryController } from "@/modules/admin/controllers/get-batch-collect-history-controller";
import { getActiveBatchCollectController } from "@/modules/admin/controllers/get-active-batch-collect-controller";
import { clearBatchCollectJobsController } from "@/modules/transfer/controllers/batch-collect-controller";
import { getMaticStatusController } from "@/modules/admin/controllers/get-matic-status-controller";
import { getMaticRechargeHistoryController } from "@/modules/admin/controllers/get-matic-recharge-history-controller";
import { getWorkersStatus } from "@/modules/admin/controllers/get-workers-status";
import { triggerWorkerController } from "@/modules/admin/controllers/trigger-worker-controller";
import { debugBalancesController } from "@/modules/admin/controllers/debug-balances-controller";
import { activateUserController } from "@/modules/admin/controllers/activate-user-controller";

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
  app.get("/batch-collect/active", getActiveBatchCollectController);
  app.get("/batch-collect/status/:jobId", getBatchCollectStatusController);
  app.get("/batch-collect/history", getBatchCollectHistoryController);
  app.delete("/batch-collect/clear", clearBatchCollectJobsController);

  // MATIC
  app.get("/matic/status", getMaticStatusController);
  app.get("/matic/recharge-history", getMaticRechargeHistoryController);

  // Workers
  app.get("/workers/status", getWorkersStatus);
  app.post("/workers/trigger/:workerName", triggerWorkerController);

  // Debug
  app.get("/debug/balances", debugBalancesController);

  // User management
  app.post("/users/activate", activateUserController);
}
