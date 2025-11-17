/**
 * Get Unread Notifications Controller
 *
 * GET /notifications/unread?cursor=xxx&limit=20
 * Retorna notificações não lidas do usuário autenticado com suporte a paginação.
 */

import { FastifyReply, FastifyRequest } from "fastify";
import { getUnreadNotifications } from "../use-cases/get-unread-notifications";

interface QueryParams {
  cursor?: string;
  limit?: string;
}

export async function getUnreadController(
  request: FastifyRequest<{ Querystring: QueryParams }>,
  reply: FastifyReply
) {
  try {
    // Usuário vem do middleware requireAuth
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const { cursor, limit } = request.query;

    const result = await getUnreadNotifications({
      userId,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error({ error }, "Error fetching unread notifications");

    return reply.status(500).send({
      error: "Failed to fetch notifications",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
