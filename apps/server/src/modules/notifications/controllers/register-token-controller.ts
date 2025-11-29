/**
 * Register Push Token Controller
 *
 * POST /notifications/register-token
 * Registra o Expo Push Token do usuário quando o app solicita permissão de notificações.
 */

import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { registerPushToken } from "../use-cases/register-push-token";

const schema = z.object({
  expoPushToken: z.string().min(1, "Expo Push Token is required"),
  deviceInfo: z
    .object({
      deviceName: z.string().optional(),
      osName: z.string().optional(),
      osVersion: z.string().optional(),
      appVersion: z.string().optional(),
    })
    .optional(),
});

export async function registerTokenController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const body = schema.parse(request.body);

    // Usuário vem do middleware requireAuth
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const result = await registerPushToken({
      userId,
      expoPushToken: body.expoPushToken,
      deviceInfo: body.deviceInfo,
    });

    return reply.status(200).send(result);
  } catch (error) {
    request.log.error({ error }, "Error registering push token");

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: "Validation error",
        details: error.issues,
      });
    }

    return reply.status(500).send({
      error: "Failed to register push token",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
