import Fastify from 'fastify'
import cors from '@fastify/cors'
import { env } from './config/env'
import authPlugin from './plugins/auth.plugin'
import { bullBoardPlugin } from './plugins/bull-board.plugin'
import { userRoutes } from './modules/user/routes'
import { depositRoutes } from './modules/deposit/routes'
import { webhookRoutes } from './modules/webhook/routes'
import { userWithdrawalRoutes, adminWithdrawalRoutes } from './modules/withdrawal/routes'
import { transferRoutes } from './modules/transfer/routes'
import { mlmRoutes } from './modules/mlm/routes'
import { adminRoutes } from './modules/admin/routes'
import { referralRoutes } from './modules/referral/routes'
import { testRoutes } from './modules/test/routes'
import { notificationsRoutes } from './modules/notifications/routes'
import { prisma } from './lib/prisma'
import { redis } from './lib/redis'

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

    // Router options
    routerOptions: {
      // Ignore trailing slashes in routes
      ignoreTrailingSlash: true,
      // Case sensitive routing
      caseSensitive: false,
    },

    // Disable x-powered-by header for security
    disableRequestLogging: env.isProduction,
  })

  // Register CORS plugin
  await app.register(cors, {
    // Allow all origins in development (for mobile app testing)
    // In production, allow frontend URL + localhost for PWA development
    origin: env.isDevelopment
      ? true
      : [
          env.FRONTEND_URL || 'http://localhost:3000',
          'http://localhost:3001', // PWA development
          'http://localhost:5173', // Vite default port
          'https://mvppir-pwa.vercel.app', // PWA production
        ],
    credentials: true,
  })

  // Register authentication plugin
  await app.register(authPlugin)

  // Register Bull Board (queue monitoring dashboard)
  await app.register(bullBoardPlugin)

  // Root route - Hello World
  app.get('/', async () => {
    return {
      message: 'Hello World!',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV
    }
  })

  // Health check (para UptimeRobot e monitoramento)
  app.get('/health', async () => {
    const checks = {
      database: 'unknown',
      redis: 'unknown',
    }

    // Check PostgreSQL
    try {
      await prisma.$queryRaw`SELECT 1`
      checks.database = 'ok'
    } catch {
      checks.database = 'error'
    }

    // Check Redis
    try {
      await redis.ping()
      checks.redis = 'ok'
    } catch {
      checks.redis = 'error'
    }

    const allOk = checks.database === 'ok' && checks.redis === 'ok'

    return {
      status: allOk ? 'ok' : 'degraded',
      checks,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  })

  // Register module routes
  await app.register(userRoutes, { prefix: '/user' })
  await app.register(depositRoutes, { prefix: '/deposit' })
  await app.register(webhookRoutes, { prefix: '/webhooks' })

  // Withdrawal routes
  await app.register(userWithdrawalRoutes, { prefix: '/user/withdrawals' })
  await app.register(adminWithdrawalRoutes, { prefix: '/admin/withdrawals' })

  // Transfer routes (admin only)
  await app.register(transferRoutes, { prefix: '/admin/transfers' })

  // Admin routes (global wallet, batch collect, matic)
  await app.register(adminRoutes, { prefix: '/admin' })

  // MLM routes
  await app.register(mlmRoutes, { prefix: '/mlm' })

  // Referral routes (public)
  await app.register(referralRoutes, { prefix: '/referral' })

  // Notifications routes (authenticated users)
  await app.register(notificationsRoutes, { prefix: '/notifications' })

  // Test routes (admin only)
  await app.register(testRoutes, { prefix: '/admin/test' })

  return app
}
