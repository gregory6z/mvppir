import { FastifyInstance } from "fastify"
import { requireAdmin } from "@/middlewares/admin.middleware"
import { injectTestDepositController } from "./controllers/inject-test-deposit.controller"
import { injectTestReferralsController } from "./controllers/inject-test-referrals.controller"

/**
 * Test routes - Admin only
 * Routes for injecting test data in development/staging
 */
export async function testRoutes(app: FastifyInstance) {
  // Protect all test routes with admin middleware
  app.addHook("onRequest", requireAdmin)

  // POST /admin/test/inject-deposit
  app.post("/inject-deposit", injectTestDepositController)

  // POST /admin/test/inject-referrals
  app.post("/inject-referrals", injectTestReferralsController)
}
