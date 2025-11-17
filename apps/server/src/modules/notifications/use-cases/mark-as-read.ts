/**
 * Mark Notification as Read Use Case
 *
 * Marca uma notificação específica como lida.
 */

import { prisma } from "@/lib/prisma";

interface MarkAsReadInput {
  userId: string;
  notificationId: string;
}

export async function markAsRead(input: MarkAsReadInput) {
  const { userId, notificationId } = input;

  // Verifica se a notificação existe e pertence ao usuário
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new Error("Notification not found or access denied");
  }

  // Marca como lida
  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      read: true,
      readAt: new Date(),
    },
  });

  console.log(`✅ Notification ${notificationId} marked as read for user ${userId}`);
}
