/**
 * Notifications Routes
 *
 * Rotas para gerenciamento de push notifications e histórico de notificações.
 */

import { FastifyInstance } from "fastify";
import { requireAuth } from "@/middlewares/auth.middleware";
import { registerTokenController } from "./controllers/register-token-controller";
import { getUnreadController } from "./controllers/get-unread-controller";
import { markAsReadController } from "./controllers/mark-as-read-controller";
import { markAllAsReadController } from "./controllers/mark-all-as-read-controller";

export async function notificationsRoutes(app: FastifyInstance) {
  // Todas as rotas requerem autenticação
  app.addHook("onRequest", requireAuth);

  // Registrar Expo Push Token
  app.post("/register-token", registerTokenController);

  // Buscar notificações não lidas
  app.get("/unread", getUnreadController);

  // Marcar notificação como lida
  app.patch("/:id/read", markAsReadController);

  // Marcar todas como lidas
  app.patch("/read-all", markAllAsReadController);
}
