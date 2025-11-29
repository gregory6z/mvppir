# API Endpoints - Backend Existente

**Base URL:** `http://localhost:3333` (development)

---

## Autenticação (Better Auth)

Rotas automáticas fornecidas pelo Better Auth:

| Method | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/api/auth/sign-up` | Criar conta de usuário | Público |
| `POST` | `/api/auth/sign-in` | Login (email + password) | Público |
| `POST` | `/api/auth/sign-out` | Logout | Autenticado |
| `GET` | `/api/auth/session` | Obter sessão atual | Autenticado |

**Nota:** Admins são criados **manualmente via SQL**, não via sign-up.

---

## User Routes (`/user`)

**Autenticação:** Todas as rotas requerem `requireAuth` middleware

| Method | Endpoint | Descrição | Response |
|--------|----------|-----------|----------|
| `GET` | `/user/account` | Info da conta do usuário | `{ id, email, name, status, role, createdAt }` |
| `GET` | `/user/balance` | Saldo por token | `{ balances: [{ tokenSymbol, availableBalance, lockedBalance }] }` |
| `GET` | `/user/transactions` | Histórico de transações | `{ transactions: [...] }` |
| `GET` | `/user/activation` | Status de ativação ($100 threshold) | `{ isActive, totalDeposited, requiredAmount }` |
| `GET` | `/user/referral` | Link de referência (MLM) | `{ referralCode, referralLink }` |

---

## Deposit Routes (`/deposit`)

| Method | Endpoint | Descrição | Auth | Response |
|--------|----------|-----------|------|----------|
| `GET` | `/deposit/my-address` | Obter endereço de depósito do usuário | Autenticado | `{ address, network }` |

---

## Withdrawal Routes (User) (`/user/withdrawals`)

**Autenticação:** `requireAuth`

| Method | Endpoint | Descrição | Request Body | Response |
|--------|----------|-----------|--------------|----------|
| `POST` | `/user/withdrawals/request` | Solicitar saque | `{ tokenSymbol, amount, toAddress }` | `{ success, withdrawal }` |
| `GET` | `/user/withdrawals` | Listar meus saques | Query: `?page=1&limit=20` | `{ withdrawals, pagination }` |

---

## Withdrawal Routes (Admin) (`/admin/withdrawals`)

**Autenticação:** `requireAdmin` middleware

### GET /admin/withdrawals

Lista todos os saques (com filtros)

**Query Parameters:**
```typescript
{
  status?: 'PENDING_APPROVAL' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'FAILED'
  page?: string    // default: "1"
  limit?: string   // default: "20"
}
```

**Response:**
```typescript
{
  withdrawals: Array<{
    id: string
    userId: string
    user: {
      id: string
      email: string
      name: string | null
    }
    tokenSymbol: string
    amount: string  // Decimal
    toAddress: string
    status: WithdrawalStatus
    txHash: string | null
    failureReason: string | null
    processedAt: Date | null
    createdAt: Date
    updatedAt: Date
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

### POST /admin/withdrawals/:id/approve

Aprovar saque pendente

**Path Parameters:**
- `id` - UUID do saque

**Request Body:** Vazio (sem body)

**Response:**
```typescript
{
  success: true
  withdrawal: Withdrawal
  notificationSent: boolean
  message: string
}
```

**Errors:**
- `404` - Withdrawal not found
- `400` - Invalid status (não está PENDING_APPROVAL)
- `500` - Internal error

### POST /admin/withdrawals/:id/reject

Rejeitar saque pendente

**Path Parameters:**
- `id` - UUID do saque

**Request Body:**
```typescript
{
  reason: string  // min: 1, max: 500 chars
}
```

**Response:**
```typescript
{
  success: true
  withdrawal: Withdrawal
  notificationSent: boolean
  message: string
}
```

**Errors:**
- `404` - Withdrawal not found
- `400` - Invalid status ou reason inválida
- `500` - Internal error

### POST /admin/withdrawals/:id/retry

Reprocessar saque que falhou

**Path Parameters:**
- `id` - UUID do saque

**Request Body:** Vazio

**Response:**
```typescript
{
  success: true
  withdrawal: Withdrawal
  message: string
}
```

**Nota:** Apenas saques com status `FAILED` e erro recuperável podem ser retry.

---

## Admin Routes (`/admin`)

**Autenticação:** Todas as rotas requerem `requireAdmin` middleware

### Global Wallet Balance

#### GET /admin/global-wallet/balance

Retorna saldos de todos os tokens na Global Wallet com conversão em USD

**Response:**
```typescript
{
  address: string               // Endereço da Global Wallet
  balances: Array<{
    tokenSymbol: string         // "USDC", "USDT", "MATIC"
    tokenAddress: string | null // Contract address (null para MATIC)
    balance: string             // Decimal
    usdValue: string            // Decimal (conversão via CoinGecko)
    lastUpdated: string         // ISO datetime
  }>
  totalUsd: string              // Decimal - soma de todos os usdValue
}
```

**Errors:**
- `404` - Global Wallet not found
- `500` - Internal error

---

### Batch Collect

#### GET /admin/batch-collect/preview

Preview do que será coletado antes de executar o batch collect

**Response:**
```typescript
{
  tokens: Array<{
    tokenSymbol: string      // "USDC", "USDT"
    walletsCount: number     // Quantidade de carteiras com saldo
    totalAmount: string      // Decimal - total a ser coletado
    gasEstimate: string      // MATIC estimado para gas (0.05 por wallet)
  }>
  totalGasEstimate: string   // MATIC total para todas as transferências
  maticBalance: string       // MATIC disponível na Global Wallet
  canExecute: boolean        // false se MATIC insuficiente
}
```

---

#### POST /admin/transfers/batch-collect

Cria um job para executar batch collect em background (Bull Queue)

**Request Body:** Vazio

**Response (HTTP 202):**
```typescript
{
  success: true
  jobId: string  // UUID do job para tracking
  message: string
}
```

**Nota:** Retorna instantaneamente. Use `jobId` para acompanhar progresso via GET /admin/batch-collect/status/:jobId

**Errors:**
- `500` - Failed to create job

---

#### GET /admin/batch-collect/status/:jobId

Status de um batch collect em execução ou concluído

**Path Parameters:**
- `jobId` - UUID do job (retornado pelo POST)

**Response:**
```typescript
// Status: WAITING (aguardando processamento)
{
  jobId: string
  status: "WAITING"
  progress: 0
  createdAt: string  // ISO datetime
}

// Status: PROCESSING (em execução)
{
  jobId: string
  status: "PROCESSING"
  progress: number   // 0-100
  startedAt: string  // ISO datetime
}

// Status: COMPLETED (sucesso)
{
  jobId: string
  status: "COMPLETED"
  progress: 100
  result: {
    success: true
    summary: {
      totalAddresses: number
      successfulAddresses: number
      failedAddresses: number
      maticDistributed: string  // MATIC enviado para gas
      tokensTransferred: Record<string, number>  // { "USDC": 10, "USDT": 5 }
      maticRecovered: string    // MATIC recuperado após transferências
      totalGasCost: string      // Custo líquido em MATIC
      transactionsUpdated: number
      durationSeconds: string
    }
    details: Array<{
      address: string
      success: boolean
      tokensTransferred: string[]
      maticDistributed: string
      maticRecovered: string
    }>
    errors: Array<{
      address: string
      success: false
      error: string
    }>
  }
  completedAt: string  // ISO datetime
}

// Status: FAILED (erro)
{
  jobId: string
  status: "FAILED"
  progress: number   // Progresso antes de falhar
  error: string
  failedAt: string   // ISO datetime
}
```

**Errors:**
- `404` - Job not found
- `500` - Internal error

---

#### GET /admin/batch-collect/history

Histórico de batch collects executados

**Query Parameters:**
```typescript
{
  limit?: string  // default: "20"
}
```

**Response:**
```typescript
{
  history: Array<{
    id: string              // Data + token (ex: "2025-10-26-USDC")
    createdAt: string       // ISO datetime
    tokenSymbol: string
    totalCollected: string  // Decimal
    walletsCount: number
    status: "COMPLETED" | "FAILED" | "PARTIAL"
    txHashes: string[]
  }>
}
```

**Nota:** Usa transações `SENT_TO_GLOBAL` como aproximação. No futuro terá tabela dedicada `batch_collect_logs`.

---

### MATIC Monitoring

#### GET /admin/matic/status

Status do MATIC na Global Wallet (saldo, estimativas, alertas)

**Response:**
```typescript
{
  balance: string              // Decimal (MATIC)
  usdValue: string             // Decimal (conversão via CoinGecko)
  estimates: {
    pendingWithdrawals: string // MATIC estimado para saques pendentes (0.05 cada)
    nextBatchCollect: string   // MATIC estimado para próximo batch collect
    recommended: string        // "50.0" - reserva recomendada
  }
  status: "OK" | "WARNING" | "CRITICAL"
  globalWalletAddress: string
}
```

**Lógica de Status:**
- `OK` - balance >= 50 MATIC
- `WARNING` - 10 <= balance < 50 MATIC
- `CRITICAL` - balance < 10 MATIC

**Errors:**
- `404` - Global Wallet not found
- `500` - Internal error

---

#### GET /admin/matic/recharge-history

Histórico de recargas de MATIC na Global Wallet

**Query Parameters:**
```typescript
{
  limit?: string  // default: "20"
}
```

**Response:**
```typescript
{
  history: Array<{
    txHash: string
    amount: string    // Decimal (MATIC)
    createdAt: string // ISO datetime
    status: "CONFIRMED" | "PENDING"
  }>
}
```

**Errors:**
- `404` - Global Wallet not found
- `500` - Internal error

---

## MLM Routes (`/mlm`)

**Autenticação:** `requireAuth`

| Method | Endpoint | Descrição | Response |
|--------|----------|-----------|----------|
| `GET` | `/mlm/profile` | Perfil MLM do usuário | `{ rank, directReferrals, networkSize, ... }` |
| `GET` | `/mlm/network` | Rede de referenciados | `{ network: [...] }` |
| `GET` | `/mlm/monthly-history` | Histórico mensal de comissões | `{ history: [...] }` |

**Nota:** MLM está implementado mas fora do escopo do Admin Dashboard v1.0

---

## Webhook Routes (`/webhooks`)

| Method | Endpoint | Descrição | Auth | Nota |
|--------|----------|-----------|------|------|
| `POST` | `/webhooks/moralis` | Webhook do Moralis (depósitos) | Signature validation | Uso interno |

**Segurança:** Valida assinatura HMAC (Keccak256) do Moralis antes de processar.

---

## Health & Monitoring

| Method | Endpoint | Descrição | Response |
|--------|----------|-----------|----------|
| `GET` | `/` | Root route | `{ message, timestamp, environment }` |
| `GET` | `/health` | Health check | `{ status: "ok", uptime, timestamp }` |
| `GET` | `/admin/queues` | Bull Board (queue monitoring) | HTML dashboard |

## Resumo: Endpoints Admin Dashboard v1.0

### ✅ Implementado e Pronto

| Feature | Endpoints | Status |
|---------|-----------|--------|
| **Autenticação** | Better Auth routes | ✅ Completo |
| **Withdrawal Management** | GET /admin/withdrawals <br> POST /admin/withdrawals/:id/approve <br> POST /admin/withdrawals/:id/reject <br> POST /admin/withdrawals/:id/retry | ✅ Completo |
| **Global Wallet Balance** | GET /admin/global-wallet/balance | ✅ Completo |
| **Batch Collect** | GET /admin/batch-collect/preview <br> POST /admin/transfers/batch-collect <br> GET /admin/batch-collect/status/:jobId <br> GET /admin/batch-collect/history | ✅ Completo (Bull Queue) |
| **MATIC Monitoring** | GET /admin/matic/status <br> GET /admin/matic/recharge-history | ✅ Completo |

### 📊 Total de Endpoints Admin

- **6 endpoints** para dashboard admin
- **4 endpoints** para withdrawal management
- **1 endpoint** para batch collect execution (POST)
- **Total:** 11 endpoints admin implementados

### 🔄 Fluxo Batch Collect com Bull Queue

1. **Preview:** `GET /admin/batch-collect/preview` - Visualizar antes de executar
2. **Execute:** `POST /admin/transfers/batch-collect` - Criar job (retorna jobId)
3. **Track:** `GET /admin/batch-collect/status/:jobId` - Acompanhar progresso
4. **History:** `GET /admin/batch-collect/history` - Ver histórico de execuções

**Vantagens do Bull Queue:**
- ✅ Processamento em background (evita timeout de 30s)
- ✅ Progress tracking em tempo real (0-100%)
- ✅ Retry automático em caso de falha
- ✅ Dashboard visual no Bull Board (`/admin/queues`)
- ✅ Logs detalhados de cada transação blockchain

---

**Última Atualização:** 2025-10-26
**Status:** ✅ Todos os 6 endpoints admin implementados com Bull Queue para batch collect
