import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .url()
    .refine((val) => val.startsWith('postgresql://'), {
      message: 'DATABASE_URL must be a valid PostgreSQL connection string',
    }),

  // Server
  PORT: z.coerce.number().int().positive().default(4000),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Authentication
  AUTH_SECRET: z.string().min(32, {
    message: 'AUTH_SECRET must be at least 32 characters long',
  }),
  API_BASE_URL: z.string().url().default('http://localhost:3333'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:')
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2))
  throw new Error('Invalid environment variables')
}

export const env = {
  ...parsedEnv.data,
  isDevelopment: parsedEnv.data.NODE_ENV === 'development',
  isProduction: parsedEnv.data.NODE_ENV === 'production',
  isTest: parsedEnv.data.NODE_ENV === 'test',
} as const
