# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **mvppir**, a cryptocurrency deposit/withdrawal platform built with Fastify, Prisma, and PostgreSQL. The system manages user deposits on Polygon blockchain, tracks wallet transactions, and implements a virtual account system with automatic activation based on deposit thresholds.

**Tech Stack:**
- **Backend:** Fastify (Node.js)
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** Better Auth (email/password)
- **Blockchain:** Ethers.js + Moralis webhooks (Polygon network)
- **Testing:** Node.js native test runner

## Development Commands

### Running the Application

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

### Database Management

```bash
# Apply migrations to development database
npm run prisma:migrate

# Generate Prisma client after schema changes
npm run prisma:generate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

### Testing

```bash
# Run integration tests (uses .env.test)
npm run test:integration
```

**Important:** Integration tests use a separate test database configured in `.env.test`. Never run tests against production database.

### Single Test Execution

```bash
# Run specific test file
NODE_ENV=test node --import tsx --test src/tests/integration/deposit-webhook.test.ts
```

## Architecture

### Core Design Principles

This codebase follows **Clean Architecture** with strict separation of concerns:

1. **Controllers** - Handle HTTP requests/responses, validate input, call use cases
2. **Use Cases** - Business logic, orchestrate multiple operations
3. **Services** - External integrations (Moralis, blockchain)
4. **Lib** - Shared utilities (encryption, token identification, Prisma client)

### Module Structure

All business features live in `src/modules/`, organized by domain:

```
src/modules/
├── deposit/          # Deposit address generation
│   ├── controllers/
│   ├── use-cases/
│   └── services/     # Moralis Stream integration
├── user/            # User account management, balance, transactions
│   ├── controllers/
│   └── use-cases/
├── webhook/         # Moralis webhook processing
│   ├── controllers/
│   └── use-cases/
└── wallet/          # Global wallet operations (planned for v2.0)
```

### Key Architectural Patterns

**1. Virtual Account System**

Users have two states:
- `INACTIVE` - Account created but not yet activated (no deposit or < $100 USD deposited)
- `ACTIVE` - User has deposited >= $100 USD equivalent
- `BLOCKED` - Admin-blocked account

Activation happens automatically in `src/modules/user/use-cases/check-account-activation.ts` when confirmed deposits reach $100 USD threshold.

**2. Transaction Flow (PENDING → CONFIRMED)**

The system implements a two-phase deposit flow:

```
Webhook arrives → Create transaction with status=PENDING
              ↓
Webhook arrives again with confirmed=true → Update to CONFIRMED
              ↓
Check account activation ($100 threshold)
```

This is handled in `src/modules/webhook/use-cases/process-moralis-webhook.ts`.

**3. One Deposit Address Per User**

Each user gets exactly one Polygon address for all deposits (created in `src/modules/deposit/use-cases/get-or-create-deposit-address.ts`). This address:
- Is generated using ethers.js Wallet.createRandom()
- Has its private key encrypted (AES-256-GCM) before database storage
- Is automatically registered with Moralis Stream for webhook monitoring
- Accepts ANY token (USDC, USDT, MATIC, or unknown tokens)

**4. Token Identification System**

Located in `src/lib/tokens.ts`, this system:
- Maps known token addresses to symbols/decimals (USDC=6, MATIC=18, etc.)
- Falls back to webhook-provided metadata for unknown tokens
- Never rejects deposits for unrecognized tokens (accepts all)

### Database Schema (Key Models)

```prisma
User
  ├─ status: INACTIVE | ACTIVE | BLOCKED
  ├─ activatedAt: DateTime?
  └─ Relations: depositAddresses[], transactions[]

DepositAddress
  ├─ polygonAddress: String (unique, lowercase)
  ├─ privateKey: String (encrypted)
  └─ status: ACTIVE | INACTIVE

WalletTransaction
  ├─ type: CREDIT | DEBIT
  ├─ status: PENDING | CONFIRMED | SENT_TO_GLOBAL | FAILED
  ├─ tokenSymbol, tokenAddress, tokenDecimals
  ├─ amount: Decimal (converted with decimals)
  └─ rawAmount: String (blockchain raw value)

GlobalWallet
  └─ Central wallet to receive all funds (v2.0 feature)
```

### Environment Configuration

The system uses **environment-specific .env files**:
- `.env` - Development/production
- `.env.test` - Integration tests (separate database!)

Configuration is validated via Zod schema in `src/config/env.ts`. Missing or invalid variables throw errors at startup.

**Critical Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Min 32 chars for Better Auth
- `ENCRYPTION_KEY` - 64 hex chars (32 bytes) for AES-256-GCM (encrypts all private keys)
- `MORALIS_STREAM_SECRET` - Validates webhook signatures
- `MORALIS_API_KEY` - For Moralis Stream API

**Note:** Global Wallet private key is stored **encrypted in the database** (table `global_wallets`), not in .env. Only `ENCRYPTION_KEY` is needed to decrypt it.

### Path Aliases

Configured in `tsconfig.json`:

```typescript
import { prisma } from "@/lib/prisma"
import { processMoralisWebhook } from "@/modules/webhook/use-cases/process-moralis-webhook"
import { authMiddleware } from "@/middlewares/auth.middleware"
```

### Authentication

Uses **Better Auth** (`better-auth` npm package) configured in:
- `src/lib/auth.ts` - Auth instance configuration
- `src/plugins/auth.plugin.ts` - Fastify plugin that mounts auth routes
- `src/middlewares/auth.middleware.ts` - Protect routes with `requireAuth`
- `src/middlewares/admin.middleware.ts` - Protect admin routes with `requireAdmin` (v2.0)

**Important:** Better Auth automatically creates routes:
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session

### Role-Based Access Control (v2.0)

The system uses a `role` field in the User model to differentiate between users and admins:

**User Roles:**
- `user` - Default role for all signups
- `admin` - Administrative access (created manually only)

**Creating Admins (Development):**

Admins are created **MANUALLY** via direct database access. No signup route for admins exists (security by design).

```bash
# Option 1: Prisma Studio (development only)
npx prisma studio
# Navigate to 'users' table, edit role field to "admin"

# Option 2: SQL via psql (works in dev and prod)
psql -U postgres -d mvppir
```

```sql
UPDATE users
SET role = 'admin', status = 'ACTIVE'
WHERE email = 'admin@example.com'
RETURNING id, email, role;
```

**Creating Admins (Production):**

**NEVER use Prisma Studio in production.** Use SQL directly:

```bash
# SSH into production server
ssh user@production-server

# Connect to PostgreSQL
psql $DATABASE_URL

# Promote user to admin (email doesn't need to be real/valid)
UPDATE users
SET role = 'admin', status = 'ACTIVE'
WHERE email = 'admin@example.com'
RETURNING id, email, role, status;
```

**Admin Middleware:**
- `requireAdmin` - Validates session AND role === "admin"
- All `/admin/*` routes must use this middleware via `app.addHook("onRequest", requireAdmin)`
- Admins can be blocked just like regular users (status: BLOCKED)

### Webhook Security

Moralis webhooks are verified using HMAC signature validation in `src/lib/webhook-signature.ts`. The signature uses **Keccak256** (not SHA256):

```typescript
const expectedSignature = keccak256(rawBody + MORALIS_STREAM_SECRET)
```

**Critical:** Never skip signature validation in production - prevents unauthorized deposit injection.

## Roadmap Context

### MVP v1.0 (Current - Completed)
- ✅ User authentication
- ✅ Deposit address generation
- ✅ Webhook processing (any token)
- ✅ Balance calculation
- ✅ Account activation ($100 threshold)
- ✅ Transaction history

### MVP v2.0 (Planned - See docs/PRD-MVP-v2.md)
- Batch transfer to global wallet
- Withdrawal system with admin approval
- Admin dashboard
- Rate limiting and security hardening

### MVP v3.0+ (Future)
- MLM system (commissions, referrals)
- Multi-blockchain support
- Internal token swap

## Testing Strategy

See `docs/TESTING-INTEGRATION.md` for complete testing documentation.

**Key Testing Principles:**
1. Integration tests use **separate test database** (`.env.test`)
2. Tests simulate Moralis webhooks (no real blockchain calls)
3. Tests verify complete flows: signup → login → deposit webhook → transaction creation
4. Cleanup is automatic (tests are isolated)

**When writing new tests:**
- Always set `NODE_ENV=test`
- Use `buildApp()` from `src/app.ts` to create Fastify instance
- Generate valid webhook signatures using `src/lib/webhook-signature.ts`
- Clean up test data after each test

## Code Style Conventions

1. **Use async/await** (never raw promises)
2. **Throw errors** in use cases, catch in controllers
3. **Log with context** - include transactionId, userId, txHash in logs
4. **Validate early** - Zod for input validation in controllers
5. **Keep use cases pure** - no HTTP logic, only business rules
6. **One responsibility per file** - split large use cases into smaller ones

## Common Gotchas

1. **Always lowercase Ethereum addresses** before database queries
   - Ethereum addresses are case-sensitive (checksum), but we store lowercase
   - Use `.toLowerCase()` on all addresses from webhooks/input

2. **Decimal precision for token amounts**
   - Use Prisma `Decimal` type for amounts (not Number/BigInt)
   - Store both `amount` (human-readable) and `rawAmount` (blockchain raw)

3. **Transaction idempotency**
   - Check if `txHash` already exists before creating transaction
   - Moralis may send same webhook multiple times

4. **Private key encryption**
   - NEVER log unencrypted private keys
   - Always use `encryptPrivateKey()` before storing
   - Always use `decryptPrivateKey()` before using

5. **Better Auth session cookies**
   - Use `credentials: true` in CORS config
   - Session cookie is HTTP-only (can't access from JS)
   - Get user from `request.headers.get('authorization')`

## Related Documentation

- **Full PRD:** `docs/PRD-MVP-v2.md` - Detailed product requirements
- **Testing Guide:** `docs/TESTING-INTEGRATION.md` - How to run tests
- **Roadmap:** `docs/ROADMAP.md` - Project evolution plan
