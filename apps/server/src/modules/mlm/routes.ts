import { FastifyInstance } from "fastify";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { getMLMProfileController } from "./controllers/get-mlm-profile.controller";
import { getNetworkController } from "./controllers/get-network.controller";
import { getMonthlyHistoryController } from "./controllers/get-monthly-history.controller";
import { getCommissionsSummaryController } from "./controllers/get-commissions-summary.controller";
import { getRecentCommissionsController } from "./controllers/get-recent-commissions.controller";

/**
 * MLM Routes
 *
 * All routes require authentication.
 */
export async function mlmRoutes(fastify: FastifyInstance) {
  // All MLM routes are protected
  fastify.addHook("preHandler", authMiddleware);

  // GET /mlm/profile - Get complete MLM profile for authenticated user
  fastify.get("/profile", getMLMProfileController);

  // GET /mlm/network - Get network tree (N1, N2, N3)
  fastify.get("/network", getNetworkController);

  // GET /mlm/monthly-history - Get monthly statistics history
  fastify.get("/monthly-history", getMonthlyHistoryController);

  // GET /mlm/commissions/summary - Get commission aggregations (today, thisMonth, total)
  fastify.get("/commissions/summary", getCommissionsSummaryController);

  // GET /mlm/commissions/recent?limit=10 - Get recent commissions with details
  fastify.get("/commissions/recent", getRecentCommissionsController);
}
