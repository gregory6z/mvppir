import { config } from 'dotenv'
import { z } from 'zod'
import { resolve } from 'path'

// Carrega .env.test se NODE_ENV=test, senão carrega .env
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
config({ path: resolve(process.cwd(), envFile) })

const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .url()
    .refine((val) => val.startsWith('postgresql://'), {
      message: 'DATABASE_URL must be a valid PostgreSQL connection string',
    }),

  // Redis (BullMQ for cron jobs)
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Server
  PORT: z.coerce.number().int().positive().default(3333),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Authentication
  AUTH_SECRET: z.string().min(32, {
    message: 'AUTH_SECRET must be at least 32 characters long',
  }),
  API_BASE_URL: z.string().url().default('http://localhost:3333'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  PWA_URL: z.string().url().optional(),

  // CORS - URLs permitidas separadas por vírgula
  CORS_ORIGINS: z.string().optional().transform((val) => {
    if (!val) return undefined
    return val.split(',').map((origin) => origin.trim())
  }),

  // Moralis (Blockchain Integration)
  MORALIS_API_KEY: z.string().min(1, {
    message: 'MORALIS_API_KEY is required',
  }),
  MORALIS_STREAM_SECRET: z.string().min(1, {
    message: 'MORALIS_STREAM_SECRET is required (found in Moralis Settings)',
  }),

  // Encryption (AES-256-GCM for private keys)
  ENCRYPTION_KEY: z.string().length(64, {
    message: 'ENCRYPTION_KEY must be 64 hex characters (32 bytes)',
  }),

  // Polygon Network
  POLYGON_RPC_URL: z.string().url().default('https://polygon-rpc.com'),
  POLYGON_CHAIN_ID: z.string().default('137'),

  // Global Wallet (DEPRECATED - sistema usa banco de dados)
  // A Global Wallet é criada via script e armazenada CRIPTOGRAFADA no banco
  // Essas variáveis são opcionais e não são usadas pelo código
  GLOBAL_WALLET_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
    message: 'GLOBAL_WALLET_ADDRESS must be a valid Ethereum address',
  }).optional(),
  GLOBAL_WALLET_PRIVATE_KEY: z.string().optional(),

  // Testing
  SKIP_BLOCKCHAIN_PROCESSING: z.coerce.boolean().default(false),
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
