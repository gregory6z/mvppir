/**
 * Create and Send Notification Use Case
 *
 * Cria uma notificação no banco E envia push notification para o usuário.
 * Core use case usado em todos os eventos (deposit, commission, etc).
 */

import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { sendPushNotification } from "../helpers/send-push-notification";

interface CreateAndSendNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export async function createAndSendNotification(input: CreateAndSendNotificationInput) {
  const { userId, type, title, body, data } = input;

  // 1. Busca o push token ativo do usuário
  const pushToken = await prisma.pushToken.findFirst({
    where: {
      userId,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc", // Usa o mais recente
    },
    select: {
      expoPushToken: true,
    },
  });

  let pushSent = false;
  let pushError: string | undefined;

  // 2. Se tiver token, envia push notification
  if (pushToken) {
    const result = await sendPushNotification({
      expoPushToken: pushToken.expoPushToken,
      title,
      body,
      data,
      sound: "default",
      priority: "high",
    });

    pushSent = result.success;
    pushError = result.error;
  }

  // 3. Salva notificação no banco (histórico)
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      data: data || {},
      pushSent,
      pushError,
      read: false,
    },
  });

  return {
    notificationId: notification.id,
    pushSent,
    pushError,
  };
}
