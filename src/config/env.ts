import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .url()
    .refine((val) => val.startsWith('postgresql://'), {
      message: 'DATABASE_URL must be a valid PostgreSQL connection string',
    }),

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

  // Global Wallet
  GLOBAL_WALLET_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
    message: 'GLOBAL_WALLET_ADDRESS must be a valid Ethereum address',
  }),
  GLOBAL_WALLET_PRIVATE_KEY: z.string().min(1, {
    message: 'GLOBAL_WALLET_PRIVATE_KEY is required',
  }),
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
