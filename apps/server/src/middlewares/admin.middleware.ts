import { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Middleware que verifica se o usuário está autenticado E é admin
 */
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  console.log(`🛡️ [AdminMiddleware] Request: ${request.method} ${request.url}`);

  try {
    // Extrai session do cookie/header
    const session = await auth.api.getSession({
      headers: request.headers as any,
    });

    if (!session) {
      return reply.status(401).send({
        error: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    // Busca usuário completo do banco
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return reply.status(401).send({
        error: "USER_NOT_FOUND",
        message: "User not found",
      });
    }

    // Verifica se é admin
    if (user.role !== "ADMIN") {
      return reply.status(403).send({
        error: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    // Verifica se admin está bloqueado
    if (user.status === "BLOCKED") {
      return reply.status(403).send({
        error: "ACCOUNT_BLOCKED",
        message: "Your admin account has been blocked",
      });
    }

    // Adiciona user completo no request para uso nos controllers
    request.user = user;
  } catch (error) {
    request.log.error({ error }, "Admin authentication error");
    return reply.status(401).send({
      error: "AUTHENTICATION_ERROR",
      message: "Failed to authenticate admin",
    });
  }
}
