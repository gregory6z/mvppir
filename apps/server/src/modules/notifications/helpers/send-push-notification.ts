/**
 * Send Push Notification Helper
 *
 * Envia notificações push via Expo Push Notification Service.
 * Utilizado para notificar usuários sobre eventos importantes (depósitos, comissões, etc).
 */

import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";

// Inicializa o cliente Expo (singleton)
const expo = new Expo();

interface SendPushNotificationInput {
  expoPushToken: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: "default" | "normal" | "high";
  sound?: "default" | null;
  badge?: number;
}

interface SendPushNotificationResult {
  success: boolean;
  ticket?: ExpoPushTicket;
  error?: string;
}

/**
 * Envia uma notificação push para um token Expo específico
 *
 * @param input - Dados da notificação
 * @returns Resultado do envio (success + ticket ou error)
 */
export async function sendPushNotification(
  input: SendPushNotificationInput
): Promise<SendPushNotificationResult> {
  const { expoPushToken, title, body, data, priority = "high", sound = "default", badge } = input;

  try {
    // Valida se o token é válido (formato Expo)
    if (!Expo.isExpoPushToken(expoPushToken)) {
      return {
        success: false,
        error: `Invalid Expo Push Token: ${expoPushToken}`,
      };
    }

    // Monta a mensagem
    const message: ExpoPushMessage = {
      to: expoPushToken,
      sound,
      title,
      body,
      data,
      priority,
      badge,
    };

    // Envia para a API do Expo
    const tickets = await expo.sendPushNotificationsAsync([message]);

    const ticket = tickets[0];

    // Verifica se houve erro imediato
    if (ticket.status === "error") {
      return {
        success: false,
        error: `Expo error: ${ticket.message} (${ticket.details?.error || "unknown"})`,
      };
    }

    // Sucesso!
    return {
      success: true,
      ticket,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error sending push notification",
    };
  }
}

/**
 * Envia notificações push em lote (bulk)
 *
 * Útil para enviar para múltiplos usuários simultaneamente.
 * Expo processa em chunks de 100 automaticamente.
 *
 * @param messages - Array de mensagens para enviar
 * @returns Array de resultados
 */
export async function sendBulkPushNotifications(
  messages: SendPushNotificationInput[]
): Promise<SendPushNotificationResult[]> {
  const expoMessages: ExpoPushMessage[] = messages
    .filter((msg) => Expo.isExpoPushToken(msg.expoPushToken))
    .map((msg) => ({
      to: msg.expoPushToken,
      sound: msg.sound || "default",
      title: msg.title,
      body: msg.body,
      data: msg.data,
      priority: msg.priority || "high",
      badge: msg.badge,
    }));

  try {
    // Expo automaticamente divide em chunks de 100
    const ticketChunks = await expo.sendPushNotificationsAsync(expoMessages);

    return ticketChunks.map((ticket) => {
      if (ticket.status === "error") {
        return {
          success: false,
          error: `${ticket.message} (${ticket.details?.error || "unknown"})`,
        };
      }

      return {
        success: true,
        ticket,
      };
    });
  } catch (error) {
    // Se falhar completamente, retorna erro para todas
    return messages.map(() => ({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }));
  }
}
