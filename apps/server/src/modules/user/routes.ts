import { FastifyInstance } from "fastify";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { getAccountController } from "./controllers/get-account-controller";
import { getBalanceController } from "./controllers/get-balance-controller";
import { getTransactionsController } from "./controllers/get-transactions-controller";
import { getActivationStatusController } from "./controllers/get-activation-status-controller";
import { getReferralLinkController } from "./controllers/get-referral-link.controller";

export async function userRoutes(fastify: FastifyInstance) {
  // Todas as rotas de user são protegidas
  fastify.addHook("preHandler", authMiddleware);

  // GET /user/account - Get user account info
  fastify.get("/account", getAccountController);

  // GET /user/balance - Get user balance por token
  fastify.get("/balance", getBalanceController);

  // GET /user/transactions - Get user transaction history
  fastify.get("/transactions", getTransactionsController);

  // GET /user/activation - Check account activation status
  fastify.get("/activation", getActivationStatusController);

  // GET /user/referral - Get referral link for inviting new users
  fastify.get("/referral", getReferralLinkController);
}
