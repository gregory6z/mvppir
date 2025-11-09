import { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { auth } from "../lib/auth";

const authPlugin: FastifyPluginAsync = async (fastify) => {
  // Registra as rotas do Better Auth em /api/auth/*
  // Fastify wildcard syntax: use :path* to match any path
  fastify.all("/api/auth/*", async (request, reply) => {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`);

        // Convert Fastify headers to standard Headers object
        const headers = new Headers();
        Object.entries(request.headers).forEach(([key, value]) => {
          if (value) headers.append(key, value.toString());
        });

        // React Native doesn't send Origin header automatically
        // Add it manually in development if missing (for mobile app support)
        if (process.env.NODE_ENV === "development" && !headers.get("origin")) {
          const host = request.headers.host || "localhost:3333";
          headers.set("origin", `http://${host}`);
          fastify.log.info({ origin: `http://${host}` }, "Auto-added Origin header for mobile");
        }

        // Log request details
        fastify.log.info({
          url: url.toString(),
          method: request.method,
          origin: request.headers.origin,
          host: request.headers.host,
        }, "Better Auth Request");

        // Create Fetch API-compatible request
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          body: request.body ? JSON.stringify(request.body) : undefined,
        });

        // Process authentication request
        const response = await auth.handler(req);

        // Log response
        fastify.log.info({
          status: response.status,
          statusText: response.statusText,
        }, "Better Auth Response");

        // If 403, log response body for debugging
        if (response.status === 403) {
          const responseText = await response.text();
          fastify.log.error({ responseText }, "Better Auth 403 Response");
          reply.status(403).send(responseText);
          return;
        }

        // Forward response to client
        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));
        reply.send(response.body ? await response.text() : null);
      } catch (error) {
        fastify.log.error({ error }, "Authentication Error");
        reply.status(500).send({
          error: "Internal authentication error",
          code: "AUTH_FAILURE",
        });
      }
    });

  // Adiciona helper para verificar autenticação
  fastify.decorate("auth", auth);
};

export default fastifyPlugin(authPlugin, {
  name: "auth-plugin",
});
