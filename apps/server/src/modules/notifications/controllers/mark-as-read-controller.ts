/**
 * Mark Notification as Read Controller
 *
 * Marca uma notificação específica como lida.
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { markAsRead } from "../use-cases/mark-as-read";

interface MarkAsReadParams {
  id: string;
}

export async function markAsReadController(
  request: FastifyRequest<{ Params: MarkAsReadParams }>,
  reply: FastifyReply
) {
  const userId = request.user?.id!;
  const notificationId = request.params.id;

  try {
    await markAsRead({ userId, notificationId });

    return reply.status(204).send();
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return reply.status(404).send({
        error: "Notification not found",
      });
    }

    throw error;
  }
}
