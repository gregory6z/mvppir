/**
 * Register Push Token Use Case
 *
 * Registra ou atualiza o Expo Push Token do usuário.
 * Chamado quando o app móvel inicia e obtém permissão de notificações.
 */

import { prisma } from "@/lib/prisma";
import { Expo } from "expo-server-sdk";

interface RegisterPushTokenInput {
  userId: string;
  expoPushToken: string;
  deviceInfo?: {
    deviceName?: string;
    osName?: string;
    osVersion?: string;
    appVersion?: string;
  };
}

interface RegisterPushTokenOutput {
  success: boolean;
  message: string;
  tokenId?: string;
}

export async function registerPushToken(
  input: RegisterPushTokenInput
): Promise<RegisterPushTokenOutput> {
  const { userId, expoPushToken, deviceInfo } = input;

  // Valida formato do token
  if (!Expo.isExpoPushToken(expoPushToken)) {
    throw new Error(`Invalid Expo Push Token format: ${expoPushToken}`);
  }

  // Verifica se usuário existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // Upsert: cria ou atualiza se já existir
  const pushToken = await prisma.pushToken.upsert({
    where: {
      userId_expoPushToken: {
        userId,
        expoPushToken,
      },
    },
    create: {
      userId,
      expoPushToken,
      deviceInfo: deviceInfo || {},
      isActive: true,
    },
    update: {
      deviceInfo: deviceInfo || {},
      isActive: true, // Reativa se estava desativado
      updatedAt: new Date(),
    },
  });

  return {
    success: true,
    message: "Push token registered successfully",
    tokenId: pushToken.id,
  };
}
