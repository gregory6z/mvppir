# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## How to Use This Document

This is a **living document** that defines conventions, patterns, and critical knowledge for working on mvppir. Claude Code automatically loads this file into context at the start of every session.

**What's in here:**
- Development workflow and best practices
- Architecture patterns and layer responsibilities
- Code style conventions and TypeScript guidelines
- Security rules and common gotchas
- Testing strategy and database commands

**Quick Navigation:**
- New to project? Read: [Project Overview](#project-overview), [Development Workflow](#development-workflow), [Architecture](#architecture)
- Starting a task? Review: [Code Style Conventions](#code-style-conventions), [Important Rules (Do NOT)](#important-rules-do-not)
- Debugging? Check: [Common Gotchas](#common-gotchas)

**Updating this file:**
- Press `#` key in Claude Code to add instructions automatically
- Keep it concise - only include what Claude needs to know to do the work
- Commit changes to Git (this is the single source of truth for the team)

## Project Overview

This is **mvppir**, a cryptocurrency deposit/withdrawal platform built with Fastify, Prisma, and PostgreSQL. The system manages user deposits on Polygon blockchain, tracks wallet transactions, and implements a virtual account system with automatic activation based on deposit thresholds.

**Tech Stack:**
- **Backend:** Fastify (Node.js)
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** Better Auth (email/password)
- **Blockchain:** Ethers.js + Moralis webhooks (Polygon network)
- **Testing:** Node.js native test runner

## Development Workflow

When working on this codebase, follow this systematic approach:

1. **Analysis Phase**
   - First, think about the problem and understand the requirements
   - Read the codebase to understand current implementation
   - Identify all relevant files and dependencies
   - Review related documentation (PRD, tests, etc.)

2. **Planning**
   - Create a mental plan with clear task breakdown
   - Track tasks using TodoWrite for complex multi-step work
   - Identify potential risks or edge cases
   - Consider backward compatibility and migration needs

3. **Validation**
   - Before starting significant changes, contact the user to validate approach
   - Discuss architectural decisions that impact multiple modules
   - Confirm breaking changes or schema modifications

4. **Implementation**
   - Work on tasks systematically, one at a time
   - Mark tasks as completed in TodoWrite as progress is made
   - Write tests alongside implementation (TDD when appropriate)
   - Follow existing code patterns and conventions

5. **Documentation**
   - At each step, provide detailed explanations of changes made
   - Document reasoning behind technical decisions
   - Update relevant documentation (CLAUDE.md, PRD, etc.)
   - Add inline comments for complex business logic

6. **Simplicity**
   - Make each task and code change as simple as possible
   - Avoid massive or complex changes - break them down
   - Each change should impact the code minimally
   - Prefer incremental improvements over rewrites
   - **Everything comes down to simplicity**

7. **Review**
   - Provide comprehensive summary of changes made
   - Highlight any relevant information or gotchas
   - Verify tests pass and code quality is maintained
   - Ensure commits are atomic and well-documented

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

# Migrate existing transactions to Balance table (one-time)
npx tsx scripts/migrate-to-balance.ts
```

**Note:** `migrate-to-balance.ts` is a one-time migration script that populates the Balance table from existing WalletTransaction records. It should only be run once after adding the Balance table to an existing database with transaction history.

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

1. **Controllers** - Handle HTTP requests/responses, validate input (Zod), call use cases
2. **Use Cases** - Business logic, orchestrate multiple operations, throw errors (no HTTP logic)
3. **Providers** - External API integrations (Moralis, CoinGecko, blockchain RPC)
4. **Lib** - Internal utilities (encryption, token identification, Prisma client)
5. **Middlewares** - Cross-cutting concerns (authentication, authorization, error handling)

### Module Structure

All business features live in `src/modules/`, organized by domain:

```
src/modules/
├── deposit/          # Deposit address generation
│   ├── controllers/  # HTTP handlers
│   ├── use-cases/    # Business logic
│   └── (no providers here - deposit uses shared providers)
├── user/            # User account management, balance, transactions
│   ├── controllers/  # HTTP handlers
│   └── use-cases/    # Business logic
├── webhook/         # Moralis webhook processing
│   ├── controllers/  # HTTP handlers
│   └── use-cases/    # Business logic
└── wallet/          # Global wallet operations (planned for v2.0)
```

**Supporting Layers:**

```
src/
├── lib/             # Internal utilities (encryption, tokens, prisma)
│   ├── auth.ts
│   ├── encryption.ts
│   ├── tokens.ts
│   └── prisma.ts
├── providers/       # External integrations (Moralis, pricing)
│   ├── moralis/
│   │   └── stream.provider.ts
│   └── price/
│       └── price.provider.ts
├── middlewares/     # Fastify middleware (auth, admin, error handling)
└── config/          # Environment validation (Zod schemas)
```

**Layer Responsibilities:**

- **Controllers** - HTTP request/response, input validation (Zod), call use cases
- **Use Cases** - Pure business logic, orchestrate operations, throw errors
- **Providers** - External API integrations (Moralis, CoinGecko, etc.)
- **Lib** - Internal utilities (encryption, token mapping, database client)
- **Middlewares** - Cross-cutting concerns (auth, CORS, rate limiting)

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

**5. Balance Architecture (Performance Layer)**

The system uses a dual-table approach for balance management:

**WalletTransaction (Event Sourcing / Audit Trail)**
- Immutable record of every deposit/withdrawal
- Source of truth for audit and reconciliation
- Allows historical balance reconstruction

**Balance (Performance Layer)**
- Pre-calculated balances for O(1) lookups (vs O(n) transaction scans)
- Atomically synchronized with WalletTransaction via `prisma.$transaction`
- Supports withdrawal workflow with available/locked distinction

**Available vs Locked Balance:**
- `availableBalance` - Funds available for withdrawal
- `lockedBalance` - Funds locked in pending withdrawals (awaiting admin approval)
- `total = availableBalance + lockedBalance`

**Atomic Synchronization Pattern:**

When deposits are confirmed, `process-moralis-webhook.ts` uses atomic transactions to sync both tables:

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Update WalletTransaction status
  await tx.walletTransaction.update({
    where: { txHash },
    data: { status: "CONFIRMED" },
  });

  // 2. Update Balance atomically
  await tx.balance.upsert({
    where: { userId_tokenSymbol: { userId, tokenSymbol } },
    create: { userId, tokenSymbol, availableBalance: amount, lockedBalance: 0 },
    update: { availableBalance: { increment: amount } },
  });
});
```

This ensures Balance always reflects confirmed transactions, with PostgreSQL providing row-level locking to prevent race conditions.

### Database Schema (Key Models)

```prisma
User
  ├─ status: INACTIVE | ACTIVE | BLOCKED
  ├─ role: user | admin (v2.0)
  ├─ activatedAt: DateTime?
  └─ Relations: depositAddresses[], transactions[], balances[]

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

Balance (Performance Layer)
  ├─ userId + tokenSymbol (unique composite key)
  ├─ availableBalance: Decimal (withdrawable funds)
  ├─ lockedBalance: Decimal (pending withdrawals)
  └─ Atomically synced with WalletTransaction on CONFIRMED status

GlobalWallet
  ├─ Central wallet to receive all funds (v2.0 feature)
  ├─ privateKey stored encrypted (not in .env)
  └─ Relations: balances[]

GlobalWalletBalance (v2.0)
  ├─ globalWalletId + tokenSymbol (unique composite key)
  ├─ balance: Decimal (total balance per token)
  └─ Tracks global wallet holdings for withdrawal processing
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
- ✅ Balance calculation (dual-table architecture with Balance + WalletTransaction)
- ✅ Account activation ($100 threshold)
- ✅ Transaction history
- ✅ Admin role-based access control

### MVP v2.0 (In Progress - See docs/PRD-MVP-v2.md)
- ✅ Balance table architecture (available/locked balances)
- ⏳ Batch transfer to global wallet
- ⏳ Withdrawal system with admin approval
- ⏳ Admin dashboard
- ⏳ Rate limiting and security hardening

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
7. **TypeScript strict mode** - all files must pass strict type checking
8. **No `any` types** - use proper TypeScript types or `unknown` with type guards
9. **Functional approach** - prefer pure functions, avoid side effects where possible
10. **Explicit over implicit** - be explicit about types, dependencies, and behavior

## Important Rules (Do NOT)

**NEVER do these things in this codebase:**

1. **DO NOT skip signature validation** on Moralis webhooks (security critical)
2. **DO NOT log unencrypted private keys** anywhere (logs, console, errors)
3. **DO NOT use `Number` for token amounts** - always use Prisma `Decimal` type
4. **DO NOT update Balance without WalletTransaction** - breaks audit trail
5. **DO NOT create admin users via signup** - only via direct database access
6. **DO NOT run tests against production database** - always use `NODE_ENV=test`
7. **DO NOT commit `.env` files** - use `.env.example` for templates
8. **DO NOT store private keys in environment variables** - encrypt in database
9. **DO NOT use `prisma.$executeRaw` for user input** - use parameterized queries
10. **DO NOT skip atomic transactions** when updating related records

**Additional Security Rules:**

- **DO NOT disable CORS** in production
- **DO NOT expose stack traces** to API responses in production
- **DO NOT trust webhook data** without signature verification
- **DO NOT allow case-sensitive address matching** - always `.toLowerCase()`

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

6. **Balance table synchronization**
   - Always use `prisma.$transaction` when updating both WalletTransaction and Balance
   - Never update Balance without creating/updating corresponding WalletTransaction (audit trail)
   - Query balances from Balance table for performance (use `getUserBalance` use case)
   - Reconcile Balance vs WalletTransaction periodically to catch sync issues
   - For withdrawals: move from `availableBalance` to `lockedBalance` atomically

## Key Files Reference

**Core Application:**
- `src/app.ts` - Fastify app setup, plugin registration, routes
- `src/server.ts` - Server entry point, starts HTTP server
- `src/config/env.ts` - Environment validation (Zod schema)

**Database:**
- `prisma/schema.prisma` - Database schema (source of truth)
- `src/lib/prisma.ts` - Prisma client instance

**Authentication & Authorization:**
- `src/lib/auth.ts` - Better Auth instance
- `src/middlewares/auth.middleware.ts` - Session validation
- `src/middlewares/admin.middleware.ts` - Admin role check

**Blockchain & Webhooks:**
- `src/modules/webhook/use-cases/process-moralis-webhook.ts` - Main webhook handler
- `src/lib/webhook-signature.ts` - Keccak256 signature validation
- `src/lib/tokens.ts` - Token identification system
- `src/providers/moralis/stream.provider.ts` - Moralis Stream API

**Critical Use Cases:**
- `src/modules/user/use-cases/get-user-balance.ts` - Balance query (O(1))
- `src/modules/user/use-cases/check-account-activation.ts` - $100 threshold check
- `src/modules/deposit/use-cases/get-or-create-deposit-address.ts` - Address generation

**Utilities:**
- `src/lib/encryption.ts` - AES-256-GCM private key encryption
- `src/providers/price/price.provider.ts` - CoinGecko price fetching

**Scripts:**
- `scripts/migrate-to-balance.ts` - One-time Balance table migration

**Documentation:**
- `docs/PRD-MVP-v2.md` - Product requirements (detailed feature specs)
- `docs/TESTING-INTEGRATION.md` - Testing strategy and examples
- `docs/ROADMAP.md` - Product evolution roadmap

## Related Documentation

- **Full PRD:** `docs/PRD-MVP-v2.md` - Detailed product requirements
- **Testing Guide:** `docs/TESTING-INTEGRATION.md` - How to run tests
- **Roadmap:** `docs/ROADMAP.md` - Project evolution plan

---

**Last Updated:** 2025-10-22
**Claude Code Version:** Optimized for claude-sonnet-4-5
