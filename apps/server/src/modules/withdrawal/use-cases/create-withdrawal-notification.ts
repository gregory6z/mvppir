import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

interface CreateNotificationRequest {
  userId: string;
  withdrawalId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

/**
 * Cria notificação de saque para o usuário
 */
export async function createWithdrawalNotification({
  userId,
  withdrawalId,
  type,
  title,
  message,
  data,
}: CreateNotificationRequest) {
  return await prisma.withdrawalNotification.create({
    data: {
      userId,
      withdrawalId,
      type,
      title,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : null,
    },
  });
}
