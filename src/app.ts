import Fastify from 'fastify'
import { env } from './config/env'

export async function buildApp() {
  const app = Fastify({
    logger: env.isDevelopment
      ? {
          level: 'info',
          transport: {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss.l',
              ignore: 'pid,hostname',
              colorize: true,
              singleLine: false,
              levelFirst: true,
              errorLikeObjectKeys: ['err', 'error'],
            },
          },
          serializers: {
            req(request) {
              return {
                method: request.method,
                url: request.url,
                remoteAddress: request.ip,
              }
            },
            res(reply) {
              return {
                statusCode: reply.statusCode,
              }
            },
          },
        }
      : {
          level: 'warn',
        },
    // Security: Timeout to prevent DoS attacks
    requestTimeout: 30000, // 30 seconds

    // Security: Body size limit
    bodyLimit: 1048576, // 1 MiB

    // Security: Protect against prototype poisoning
    onProtoPoisoning: 'error',
    onConstructorPoisoning: 'error',

    // Trust proxy headers in production (adjust based on your proxy setup)
    trustProxy: env.isProduction,

    // Ignore trailing slashes in routes
    ignoreTrailingSlash: true,

    // Case sensitive routing
    caseSensitive: false,

    // Disable x-powered-by header for security
    disableRequestLogging: env.isProduction,
  })

  // Root route - Hello World
  app.get('/', async () => {
    return {
      message: 'Hello World!',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV
    }
  })

  // Health check
  app.get('/health', async () => {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  })

  return app
}
