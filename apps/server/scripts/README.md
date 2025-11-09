# Server Scripts

This directory contains utility scripts for server maintenance and operations.

## Active Scripts

### `check-seed-status.ts`
**Purpose:** Verifies if database seed was executed successfully on Railway.

**Usage:**
```bash
railway run npx tsx scripts/check-seed-status.ts
```

**Checks:**
- Global Wallet existence
- Admin users count
- Provides deployment verification

**When to use:** After Railway deployment to verify seed execution.

---

### `migrate-to-balance.ts`
**Purpose:** One-time migration to populate Balance table from WalletTransaction history.

**Usage:**
```bash
# LOCAL ONLY - DO NOT RUN IN PRODUCTION WITHOUT BACKUP
npx tsx scripts/migrate-to-balance.ts
```

**Important:**
- One-time migration script (documented in `docs/CLAUDE.md`)
- Run ONLY when adding Balance table to existing database with transaction history
- Creates Balance records from existing CONFIRMED transactions
- Idempotent (safe to run multiple times)

**When to use:** Only needed when migrating from v1 (no Balance table) to v2 (with Balance table).

---

## Removed Scripts (2025-11-09)

The following scripts were removed as they are no longer needed:

**Replaced by `prisma/seed.ts`:**
- Admin creation scripts (create-admins-*.ts, seed-admins.ts)
- Global Wallet creation scripts (create-global-wallet.ts, import-global-wallet.ts, encrypt-private-key.ts)

**Replaced by `/admin/test/inject-deposit` route:**
- Test data scripts (simulate-deposit.ts, seed-test-data.ts, seed-transactions.ts)
- Test referral scripts (create-test-user-with-referrals.ts, add-test-referrals.ts)

**One-time fixes/debug (no longer needed):**
- All check-*.ts, fix-*.ts, generate-*.ts scripts
- Testnet deployment scripts (deploy-test-*.ts, send-matic-testnet.ts)
- MLM testing scripts (test-mlm-flow.ts, generate-daily-commission-n0.ts)

---

## For Development

For testing purposes, use the admin API routes instead of scripts:

**Inject Test Deposit:**
```bash
POST /admin/test/inject-deposit
Authorization: Bearer <admin-token>

{
  "userEmail": "user@test.com",
  "tokenSymbol": "USDC",
  "amount": 100,
  "tokenDecimals": 6
}
```

See `apps/server/CLAUDE.md` for complete testing documentation.
