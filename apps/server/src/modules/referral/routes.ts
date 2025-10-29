import type { FastifyInstance } from "fastify";
import { validateReferralController } from "./controllers/validate-referral-controller";

export async function referralRoutes(app: FastifyInstance) {
  // Public route - no authentication required
  app.get("/validate/:code", validateReferralController);
}
