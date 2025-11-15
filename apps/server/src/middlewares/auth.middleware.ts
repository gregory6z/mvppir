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
    // Better Auth com plugin bearer() aceita tanto cookies quanto Bearer token
    // Construímos um objeto headers compatível com Web Headers API
    const headersObject: Record<string, string> = {};

    // Copia todos os headers do Fastify para um objeto plano
    Object.entries(request.headers).forEach(([key, value]) => {
      if (value) {
        headersObject[key] = Array.isArray(value) ? value[0] : String(value);
      }
    });

    // Log do Authorization header para debug (apenas em dev)
    if (process.env.NODE_ENV === "development") {
      const authHeader = headersObject["authorization"];
      if (authHeader) {
        request.log.info(`Auth header present: ${authHeader.substring(0, 30)}...`);
      } else {
        request.log.warn("No Authorization header found");
      }
    }

    const session = await auth.api.getSession({
      headers: headersObject as any,
    });

    if (!session) {
      request.log.warn({
        hasAuthHeader: !!headersObject["authorization"],
        hasCookie: !!headersObject["cookie"],
      }, "No session found");

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

// Alias para ser mais descritivo
export const requireAuth = authMiddleware;
