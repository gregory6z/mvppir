/**
 * Mark All Notifications as Read Use Case
 *
 * Marca todas as notificações não lidas do usuário como lidas.
 */

import { prisma } from "@/lib/prisma";

interface MarkAllAsReadInput {
  userId: string;
}

export async function markAllAsRead(input: MarkAllAsReadInput) {
  const { userId } = input;

  // Marca todas as notificações não lidas como lidas
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });

  console.log(`✅ ${result.count} notifications marked as read for user ${userId}`);

  return {
    markedCount: result.count,
  };
}
