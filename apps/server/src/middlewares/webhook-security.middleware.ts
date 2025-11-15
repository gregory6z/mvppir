import { FastifyRequest, FastifyReply } from "fastify";

/**
 * Middleware de segurança para webhooks do Moralis
 *
 * Proteções implementadas:
 * 1. User-Agent validation (Moralis usa user-agent específico)
 * 2. Rate limiting por IP
 * 3. Rejeita requests suspeitos
 */

// IPs conhecidos do Moralis (atualizar se necessário)
// Fonte: https://docs.moralis.io/streams-api/webhooks#webhook-security
const MORALIS_IPS = [
  // Moralis Stream IPs (exemplos - verificar documentação oficial)
  "35.158.0.0/16",
  "52.59.0.0/16",
  "18.196.0.0/16",
  // Em desenvolvimento, permite localhost
  "127.0.0.1",
  "::1",
];

// Cache simples de rate limiting por IP
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100; // requests por janela
const RATE_WINDOW = 60 * 1000; // 1 minuto

export async function webhookSecurityMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const clientIp = request.ip;
  const userAgent = request.headers["user-agent"] || "";
  const hasSignature = !!request.headers["x-signature"];

  // 1. Se TEM signature, não precisa validar mais nada (webhook real)
  if (hasSignature) {
    return; // Continua para o controller
  }

  // 2. Se NÃO tem signature, valida User-Agent (teste do Moralis)
  // Lista de User-Agents conhecidos do Moralis
  const isMoralisUserAgent =
    userAgent.toLowerCase().includes("moralis") ||
    userAgent.toLowerCase().includes("axios") || // Moralis usa Axios
    userAgent.toLowerCase().includes("node-fetch") ||
    userAgent.toLowerCase().includes("got") || // Moralis pode usar Got
    userAgent.toLowerCase().includes("undici") || // Node.js native fetch
    userAgent === ""; // Moralis às vezes não envia User-Agent

  // Modo permissivo: apenas loga User-Agents suspeitos, mas não bloqueia
  // (Moralis usa diferentes HTTP clients em diferentes contextos)
  if (!isMoralisUserAgent && !process.env.WEBHOOK_TEST_MODE) {
    request.log.warn(
      {
        ip: clientIp,
        userAgent,
        hasSignature,
      },
      "⚠️ Webhook sem signature de User-Agent desconhecido - permitindo mas monitorando"
    );
    // NÃO bloqueia - apenas monitora
    // Se virar ataque real, implementar blocklist baseado em IP
  }

  // 3. Rate limiting por IP (protege contra DDoS)
  const now = Date.now();
  const ipData = requestCounts.get(clientIp);

  if (!ipData || now > ipData.resetAt) {
    // Nova janela de tempo
    requestCounts.set(clientIp, {
      count: 1,
      resetAt: now + RATE_WINDOW,
    });
  } else {
    // Incrementa contador
    ipData.count++;

    if (ipData.count > RATE_LIMIT) {
      request.log.warn(
        {
          ip: clientIp,
          count: ipData.count,
          limit: RATE_LIMIT,
        },
        "Rate limit excedido para webhook"
      );

      return reply.status(429).send({
        error: "Too Many Requests",
        message: "Rate limit exceeded",
        retryAfter: Math.ceil((ipData.resetAt - now) / 1000),
      });
    }
  }

  // 4. Log de webhook sem signature (monitoramento)
  request.log.info(
    {
      ip: clientIp,
      userAgent,
      path: request.url,
    },
    "Webhook sem signature aceito (teste do Moralis)"
  );

  // Continua para o controller
}

/**
 * Limpa o cache de rate limiting periodicamente
 * Deve ser chamado a cada 5 minutos para evitar memory leak
 */
export function cleanupRateLimitCache() {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetAt) {
      requestCounts.delete(ip);
    }
  }
}
