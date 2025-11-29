# Backend TODO - Admin Dashboard v1.0

## Endpoints que PRECISAM ser implementados

---

## 1. Global Wallet Balance

### GET /admin/global-wallet/balance

**Objetivo:** Retornar saldos de todos os tokens na Global Wallet

**Autenticação:** `requireAdmin`

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

**Implementação sugerida:**
```typescript
// src/modules/admin/controllers/get-global-wallet-balance-controller.ts
import { FastifyRequest, FastifyReply } from "fastify"
import { prisma } from "@/lib/prisma"
import { getPrices } from "@/providers/price/price.provider"

export async function getGlobalWalletBalanceController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // 1. Buscar Global Wallet
    const globalWallet = await prisma.globalWallet.findFirst({
      include: {
        balances: true
      }
    })

    if (!globalWallet) {
      return reply.status(404).send({
        error: "GLOBAL_WALLET_NOT_FOUND",
        message: "Global Wallet not configured"
      })
    }

    // 2. Buscar preços em USD (CoinGecko)
    const tokenSymbols = globalWallet.balances.map(b => b.tokenSymbol)
    const prices = await getPrices(tokenSymbols)

    // 3. Calcular USD values
    const balances = globalWallet.balances.map(b => {
      const usdPrice = prices[b.tokenSymbol] || 0
      const usdValue = Number(b.balance) * usdPrice

      return {
        tokenSymbol: b.tokenSymbol,
        tokenAddress: b.tokenAddress,
        balance: b.balance.toString(),
        usdValue: usdValue.toFixed(2),
        lastUpdated: b.updatedAt.toISOString()
      }
    })

    const totalUsd = balances.reduce((sum, b) => sum + Number(b.usdValue), 0)

    return reply.status(200).send({
      address: globalWallet.polygonAddress,
      balances,
      totalUsd: totalUsd.toFixed(2)
    })
  } catch (error) {
    request.log.error({ error }, "Error getting global wallet balance")
    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to get global wallet balance"
    })
  }
}
```

**Rota:**
```typescript
// src/modules/admin/routes.ts
app.get("/global-wallet/balance", getGlobalWalletBalanceController)
```

---

## 2. Batch Collect Status/Preview

### GET /admin/batch-collect/preview

**Objetivo:** Preview do que será coletado (antes de executar)

**Autenticação:** `requireAdmin`

**Response:**
```typescript
{
  tokens: Array<{
    tokenSymbol: string      // "USDC", "USDT"
    walletsCount: number     // Quantidade de carteiras com saldo
    totalAmount: string      // Decimal - total a ser coletado
    gasEstimate: string      // MATIC estimado para gas
  }>
  totalGasEstimate: string   // MATIC total para todas as transferências
  maticBalance: string       // MATIC disponível na Global Wallet
  canExecute: boolean        // false se MATIC insuficiente
}
```

**Implementação sugerida:**
```typescript
// src/modules/admin/controllers/get-batch-collect-preview-controller.ts
export async function getBatchCollectPreviewController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // 1. Buscar todas as transações CONFIRMED que ainda não foram transferidas
    const confirmedTransactions = await prisma.walletTransaction.findMany({
      where: {
        status: "CONFIRMED"
      },
      include: {
        depositAddress: true
      }
    })

    // 2. Agrupar por token
    const tokenGroups = confirmedTransactions.reduce((acc, tx) => {
      if (!acc[tx.tokenSymbol]) {
        acc[tx.tokenSymbol] = {
          wallets: new Set(),
          totalAmount: 0
        }
      }
      acc[tx.tokenSymbol].wallets.add(tx.depositAddress.polygonAddress)
      acc[tx.tokenSymbol].totalAmount += Number(tx.amount)
      return acc
    }, {} as Record<string, { wallets: Set<string>, totalAmount: number }>)

    // 3. Estimar gas (0.05 MATIC por transferência - valor aproximado)
    const GAS_PER_TRANSFER = 0.05
    const tokens = Object.entries(tokenGroups).map(([tokenSymbol, data]) => {
      const walletsCount = data.wallets.size
      const gasEstimate = walletsCount * GAS_PER_TRANSFER

      return {
        tokenSymbol,
        walletsCount,
        totalAmount: data.totalAmount.toFixed(8),
        gasEstimate: gasEstimate.toFixed(8)
      }
    })

    const totalGasEstimate = tokens.reduce((sum, t) => sum + Number(t.gasEstimate), 0)

    // 4. Buscar saldo de MATIC na Global Wallet
    const globalWallet = await prisma.globalWallet.findFirst({
      include: {
        balances: {
          where: { tokenSymbol: "MATIC" }
        }
      }
    })

    const maticBalance = globalWallet?.balances[0]?.balance || 0
    const canExecute = Number(maticBalance) >= totalGasEstimate

    return reply.status(200).send({
      tokens,
      totalGasEstimate: totalGasEstimate.toFixed(8),
      maticBalance: maticBalance.toString(),
      canExecute
    })
  } catch (error) {
    request.log.error({ error }, "Error getting batch collect preview")
    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to get preview"
    })
  }
}
```

### GET /admin/batch-collect/status/:jobId

**Objetivo:** Status de um batch collect em execução

**Autenticação:** `requireAdmin`

**Path Parameters:**
- `jobId` - ID do job (retornado por POST /admin/transfers/batch-collect)

**Response:**
```typescript
{
  jobId: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  progress: {
    total: number      // Total de transferências
    completed: number  // Concluídas
    failed: number     // Falhadas
  }
  results?: Array<{
    userId: string
    tokenSymbol: string
    amount: string
    txHash?: string
    error?: string
  }>
}
```

**Nota:** Requer integração com Bull Queue (já está configurado no projeto)

### GET /admin/batch-collect/history

**Objetivo:** Histórico de batch collects executados

**Autenticação:** `requireAdmin`

**Query Parameters:**
- `limit` - Quantidade de resultados (default: 20)

**Response:**
```typescript
{
  history: Array<{
    id: string
    createdAt: string
    tokenSymbol: string
    totalCollected: string
    walletsCount: number
    status: 'COMPLETED' | 'FAILED' | 'PARTIAL'
    txHashes: string[]
  }>
}
```

**Implementação:** Criar tabela `batch_collect_logs` para armazenar histórico

---

## 3. MATIC Monitoring

### GET /admin/matic/status

**Objetivo:** Status do MATIC (saldo, estimativas, alertas)

**Autenticação:** `requireAdmin`

**Response:**
```typescript
{
  balance: string              // Decimal (MATIC)
  usdValue: string             // Decimal
  estimates: {
    pendingWithdrawals: string // MATIC estimado para saques pendentes
    nextBatchCollect: string   // MATIC estimado para próximo batch collect
    recommended: string        // MATIC recomendado para reserva (50 MATIC)
  }
  status: 'OK' | 'WARNING' | 'CRITICAL'
  globalWalletAddress: string
}
```

**Lógica de Status:**
- `OK` - balance >= 50 MATIC
- `WARNING` - 10 <= balance < 50 MATIC
- `CRITICAL` - balance < 10 MATIC

**Implementação sugerida:**
```typescript
// src/modules/admin/controllers/get-matic-status-controller.ts
export async function getMaticStatusController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // 1. Buscar saldo de MATIC na Global Wallet
    const globalWallet = await prisma.globalWallet.findFirst({
      include: {
        balances: {
          where: { tokenSymbol: "MATIC" }
        }
      }
    })

    if (!globalWallet) {
      return reply.status(404).send({
        error: "GLOBAL_WALLET_NOT_FOUND",
        message: "Global Wallet not configured"
      })
    }

    const maticBalance = globalWallet.balances[0]?.balance || 0

    // 2. Estimar consumo para saques pendentes
    const pendingWithdrawals = await prisma.withdrawal.count({
      where: { status: "APPROVED" }
    })
    const pendingWithdrawalsGas = pendingWithdrawals * 0.05 // 0.05 MATIC por saque

    // 3. Estimar próximo batch collect (usar preview)
    const confirmedCount = await prisma.walletTransaction.count({
      where: { status: "CONFIRMED" }
    })
    const nextBatchCollectGas = confirmedCount * 0.05

    // 4. Reserva recomendada
    const recommended = 50

    // 5. Calcular status
    const balanceNum = Number(maticBalance)
    let status: 'OK' | 'WARNING' | 'CRITICAL'
    if (balanceNum >= 50) status = 'OK'
    else if (balanceNum >= 10) status = 'WARNING'
    else status = 'CRITICAL'

    // 6. Buscar preço do MATIC
    const prices = await getPrices(["MATIC"])
    const usdValue = balanceNum * (prices.MATIC || 0)

    return reply.status(200).send({
      balance: maticBalance.toString(),
      usdValue: usdValue.toFixed(2),
      estimates: {
        pendingWithdrawals: pendingWithdrawalsGas.toFixed(8),
        nextBatchCollect: nextBatchCollectGas.toFixed(8),
        recommended: recommended.toString()
      },
      status,
      globalWalletAddress: globalWallet.polygonAddress
    })
  } catch (error) {
    request.log.error({ error }, "Error getting MATIC status")
    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to get MATIC status"
    })
  }
}
```

### GET /admin/matic/recharge-history

**Objetivo:** Histórico de recargas de MATIC na Global Wallet

**Autenticação:** `requireAdmin`

**Query Parameters:**
- `limit` - Quantidade de resultados (default: 20)

**Response:**
```typescript
{
  history: Array<{
    txHash: string
    amount: string    // MATIC
    createdAt: string
    status: 'CONFIRMED' | 'PENDING'
  }>
}
```

**Implementação sugerida:**
```typescript
export async function getMaticRechargeHistoryController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { limit = "20" } = request.query as { limit?: string }
    const limitNum = parseInt(limit, 10)

    // Buscar transações de MATIC para a Global Wallet
    // (depósitos de MATIC direto na Global Wallet address)
    const globalWallet = await prisma.globalWallet.findFirst()

    if (!globalWallet) {
      return reply.status(404).send({
        error: "GLOBAL_WALLET_NOT_FOUND",
        message: "Global Wallet not configured"
      })
    }

    // Buscar WalletTransactions de MATIC para o endereço da Global Wallet
    // Nota: Isso assume que depósitos na Global Wallet também são registrados em WalletTransaction
    // Se não forem, criar uma tabela separada GlobalWalletDeposit

    const recharges = await prisma.walletTransaction.findMany({
      where: {
        tokenSymbol: "MATIC",
        depositAddress: {
          polygonAddress: globalWallet.polygonAddress
        }
      },
      take: limitNum,
      orderBy: { createdAt: "desc" }
    })

    const history = recharges.map(tx => ({
      txHash: tx.txHash,
      amount: tx.amount.toString(),
      createdAt: tx.createdAt.toISOString(),
      status: tx.status === "CONFIRMED" ? "CONFIRMED" : "PENDING"
    }))

    return reply.status(200).send({ history })
  } catch (error) {
    request.log.error({ error }, "Error getting MATIC recharge history")
    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to get recharge history"
    })
  }
}
```

---

## 4. Rotas Admin (Consolidação)

### Criar arquivo de rotas admin

```typescript
// src/modules/admin/routes.ts
import { FastifyInstance } from "fastify"
import { requireAdmin } from "@/middlewares/admin.middleware"
import { getGlobalWalletBalanceController } from "./controllers/get-global-wallet-balance-controller"
import { getBatchCollectPreviewController } from "./controllers/get-batch-collect-preview-controller"
import { getBatchCollectStatusController } from "./controllers/get-batch-collect-status-controller"
import { getBatchCollectHistoryController } from "./controllers/get-batch-collect-history-controller"
import { getMaticStatusController } from "./controllers/get-matic-status-controller"
import { getMaticRechargeHistoryController } from "./controllers/get-matic-recharge-history-controller"

export async function adminRoutes(app: FastifyInstance) {
  // Todas as rotas requerem permissão de admin
  app.addHook("onRequest", requireAdmin)

  // Global Wallet
  app.get("/global-wallet/balance", getGlobalWalletBalanceController)

  // Batch Collect
  app.get("/batch-collect/preview", getBatchCollectPreviewController)
  app.get("/batch-collect/status/:jobId", getBatchCollectStatusController)
  app.get("/batch-collect/history", getBatchCollectHistoryController)

  // MATIC
  app.get("/matic/status", getMaticStatusController)
  app.get("/matic/recharge-history", getMaticRechargeHistoryController)
}
```

### Registrar no app.ts

```typescript
// src/app.ts
import { adminRoutes } from './modules/admin/routes'

// ...
await app.register(adminRoutes, { prefix: '/admin' })
```

---

## 5. Migration: Tabela de Histórico de Batch Collect

```sql
-- Criar tabela para histórico de batch collects
CREATE TABLE batch_collect_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  token_symbol VARCHAR(10) NOT NULL,
  total_collected DECIMAL(20, 8) NOT NULL,
  wallets_count INT NOT NULL,
  status VARCHAR(20) NOT NULL, -- COMPLETED, FAILED, PARTIAL
  tx_hashes TEXT[], -- Array de transaction hashes
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_batch_collect_logs_created_at ON batch_collect_logs(created_at DESC);
```

---

## Resumo: Checklist de Implementação

### Prioridade ALTA (MVP v1.0)

- [ ] **Global Wallet Balance**
  - [ ] Controller: `get-global-wallet-balance-controller.ts`
  - [ ] Rota: `GET /admin/global-wallet/balance`
  - [ ] Use case (opcional): `get-global-wallet-balance.ts`

- [ ] **Batch Collect Preview/Status**
  - [ ] Controller: `get-batch-collect-preview-controller.ts`
  - [ ] Rota: `GET /admin/batch-collect/preview`
  - [ ] Controller: `get-batch-collect-status-controller.ts`
  - [ ] Rota: `GET /admin/batch-collect/status/:jobId`
  - [ ] Controller: `get-batch-collect-history-controller.ts`
  - [ ] Rota: `GET /admin/batch-collect/history`
  - [ ] Migration: Criar tabela `batch_collect_logs`
  - [ ] Atualizar `batch-collect-controller.ts` para salvar log

- [ ] **MATIC Monitoring**
  - [ ] Controller: `get-matic-status-controller.ts`
  - [ ] Rota: `GET /admin/matic/status`
  - [ ] Controller: `get-matic-recharge-history-controller.ts`
  - [ ] Rota: `GET /admin/matic/recharge-history`

- [ ] **Admin Routes Consolidation**
  - [ ] Criar `src/modules/admin/routes.ts`
  - [ ] Registrar no `src/app.ts`

---

## Estimativa de Tempo

| Task | Complexidade | Tempo Estimado |
|------|--------------|----------------|
| Global Wallet Balance | Baixa | 1-2 horas |
| Batch Collect Preview | Média | 2-3 horas |
| Batch Collect Status/History | Alta (requer Bull Queue) | 4-6 horas |
| MATIC Status | Baixa | 1-2 horas |
| MATIC Recharge History | Baixa | 1 hora |
| Routes + Integration | Baixa | 1 hora |

**Total estimado:** 10-15 horas (1-2 dias de trabalho)

---

**Última atualização:** 2025-10-26
