/**
 * Get Unread Notifications Controller
 *
 * GET /notifications/unread
 * Retorna todas as notificações não lidas do usuário autenticado.
 */

import { FastifyReply, FastifyRequest } from "fastify";
import { getUnreadNotifications } from "../use-cases/get-unread-notifications";

export async function getUnreadController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Usuário vem do middleware requireAuth
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const result = await getUnreadNotifications({ userId });

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error({ error }, "Error fetching unread notifications");

    return reply.status(500).send({
      error: "Failed to fetch notifications",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
