/**
 * Get Unread Notifications Use Case
 *
 * Retorna notificações não lidas do usuário com suporte a paginação cursor-based.
 * Usado para exibir badge count e lista de notificações no app com scroll infinito.
 */

import { prisma } from "@/lib/prisma";

interface GetUnreadNotificationsInput {
  userId: string;
  limit?: number;
  cursor?: string; // ID da última notificação da página anterior (cursor-based pagination)
}

export async function getUnreadNotifications(input: GetUnreadNotificationsInput) {
  const { userId, limit = 20, cursor } = input;

  // Busca notificações não lidas, ordenadas por mais recentes
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      read: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit + 1, // Pega +1 para saber se tem mais páginas
    ...(cursor && {
      cursor: {
        id: cursor,
      },
      skip: 1, // Pula o cursor
    }),
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      data: true,
      createdAt: true,
    },
  });

  // Verifica se tem próxima página
  const hasMore = notifications.length > limit;
  const items = hasMore ? notifications.slice(0, limit) : notifications;

  // Próximo cursor é o ID da última notificação retornada
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });

  return {
    notifications: items,
    unreadCount,
    nextCursor,
    hasMore,
  };
}
