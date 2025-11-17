/**
 * Mark All Notifications as Read Controller
 *
 * Marca todas as notificações não lidas do usuário como lidas.
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { markAllAsRead } from "../use-cases/mark-all-as-read";

export async function markAllAsReadController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.userId!;

  const result = await markAllAsRead({ userId });

  return reply.status(200).send(result);
}
