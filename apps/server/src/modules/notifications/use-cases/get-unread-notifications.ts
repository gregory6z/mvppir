/**
 * Get Unread Notifications Use Case
 *
 * Retorna todas as notificações não lidas do usuário.
 * Usado para exibir badge count e lista de notificações no app.
 */

import { prisma } from "@/lib/prisma";

interface GetUnreadNotificationsInput {
  userId: string;
  limit?: number;
}

export async function getUnreadNotifications(input: GetUnreadNotificationsInput) {
  const { userId, limit = 50 } = input;

  // Busca notificações não lidas, ordenadas por mais recentes
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      read: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      data: true,
      createdAt: true,
    },
  });

  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });

  return {
    notifications,
    unreadCount,
  };
}
