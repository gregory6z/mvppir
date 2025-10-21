import { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../lib/auth";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    });

    if (!session) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "Sessão inválida ou expirada",
      });
    }

    // Adiciona o usuário ao request
    request.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: "user",
    };
  } catch (error) {
    request.log.error(error, "Erro ao verificar autenticação");
    return reply.status(401).send({
      error: "Unauthorized",
      message: "Falha ao verificar autenticação",
    });
  }
}
