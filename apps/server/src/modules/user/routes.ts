import { FastifyInstance } from "fastify";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { getAccountController } from "./controllers/get-account-controller";
import { getBalanceController } from "./controllers/get-balance-controller";
import { getOnChainBalanceController } from "./controllers/get-onchain-balance-controller";
import { getTransactionsController } from "./controllers/get-transactions-controller";
import { getUnifiedTransactionsController } from "./controllers/get-unified-transactions-controller";
import { getActivationStatusController } from "./controllers/get-activation-status-controller";
import { getReferralLinkController } from "./controllers/get-referral-link.controller";
import { getUserStatusController } from "./controllers/get-user-status-controller";
import { unblockBalanceController } from "./controllers/unblock-balance-controller";

export async function userRoutes(fastify: FastifyInstance) {
  // Todas as rotas de user são protegidas
  fastify.addHook("preHandler", authMiddleware);

  // GET /user/account - Get user account info
  fastify.get("/account", getAccountController);

  // GET /user/balance - Get user balance por token
  fastify.get("/balance", getBalanceController);

  // GET /user/balance/onchain - Get user balance directly from blockchain
  fastify.get("/balance/onchain", getOnChainBalanceController);

  // GET /user/transactions - Get user transaction history (wallet only - deprecated)
  fastify.get("/transactions", getTransactionsController);

  // GET /user/transactions/all - Get unified transactions (wallet + commissions with USD values)
  fastify.get("/transactions/all", getUnifiedTransactionsController);

  // GET /user/activation - Check account activation status
  fastify.get("/activation", getActivationStatusController);

  // GET /user/status - Get user account status (INACTIVE/ACTIVE/BLOCKED) + activation progress
  fastify.get("/status", getUserStatusController);

  // GET /user/referral - Get referral link for inviting new users
  fastify.get("/referral", getReferralLinkController);

  // POST /user/balance/unblock - Manually unblock USDC balance (blockedBalance → availableBalance)
  fastify.post("/balance/unblock", unblockBalanceController);
}
