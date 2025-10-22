# PRD - Product Requirements Document
## MVP v2.0 - Transferências, Saques e Administração

**Versão:** 2.0
**Data:** 21 de Outubro de 2025
**Status:** Planejamento
**Autor:** Equipe de Desenvolvimento

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [O que foi entregue no v1.0](#o-que-foi-entregue-no-v10)
3. [Objetivos do v2.0](#objetivos-do-v20)
4. [Funcionalidades v2.0](#funcionalidades-v20)
5. [Fora do Escopo v2.0](#fora-do-escopo-v20)
6. [Especificações Técnicas](#especificações-técnicas)

---

## 🎯 Visão Geral

O MVP v2.0 completa o ciclo financeiro do sistema, implementando transferências em lote, sistema de saques, e ferramentas administrativas para gerenciar a plataforma.

### Problema a Resolver

Com o v1.0, usuários podem:
- ✅ Criar conta e fazer login
- ✅ Receber endereço de depósito
- ✅ Fazer depósitos (qualquer token)
- ✅ Ver saldo e transações

**Mas não podem:**
- ❌ Sacar fundos
- ❌ Admins não têm controle sobre transferências
- ❌ Tokens ficam espalhados em múltiplos endereços (alto custo de gas)

---

## ✅ O que foi entregue no v1.0

### Funcionalidades Implementadas
1. **Autenticação** - Better Auth (email/password)
2. **Sistema de Conta Virtual** - Status INACTIVE → ACTIVE
3. **Ativação Automática** - Após depósito >= $100 USD
4. **Endereço Fixo Polygon** - 1 por usuário, permanente
5. **Detecção de Depósitos** - Webhook Moralis (qualquer token)
6. **Conversão de Preços** - CoinGecko API (tokens → USD)
7. **Gestão de Saldo** - Multi-token, calculado em tempo real
8. **Histórico de Transações** - Completo por usuário

### Banco de Dados v1.0
- ✅ User (autenticação + conta)
- ✅ DepositAddress (1 por usuário)
- ✅ WalletTransaction (histórico)
- ✅ GlobalWallet (criado mas não usado)

### Status Atual
- Tokens ficam nos endereços individuais dos usuários
- Global Wallet existe mas não recebe fundos
- Sistema preparado para próxima fase

---

## 🎯 Objetivos do v2.0

### Objetivos de Negócio
1. Permitir que usuários saquem seus fundos
2. Centralizar fundos na Global Wallet (reduzir custo de gas)
3. Dar aos admins controle sobre o fluxo financeiro
4. Preparar infraestrutura para MLM (fase 3)

### Objetivos Técnicos
1. ✅ Implementar job/rota de transferência em lote
2. ✅ Implementar sistema completo de saques
3. ✅ Criar painel administrativo básico
4. ✅ Otimizar custos de gas com batch transfers
5. ✅ Adicionar rate limiting e segurança

---

## 📦 Funcionalidades v2.0

### F1: Transferência em Lote para Global Wallet

**Descrição:** Rota administrativa que transfere todos os tokens de todos os endereços de usuários para a Global Wallet em uma única operação em lote.

**Critérios de Aceitação:**
- ✅ Rota protegida por autenticação de admin
- ✅ Busca todos os endereços com saldo > 0
- ✅ **Fase 1:** Distribui MATIC da global para endereços que precisam
- ✅ **Fase 2:** Transfere todos os tokens → global
- ✅ **Fase 3:** Recupera MATIC que sobrou
- ✅ Atualiza status das transações para `SENT_TO_GLOBAL`
- ✅ Registra hash de cada transferência
- ✅ Tratamento robusto de erros (retry, logging)
- ✅ Endpoint retorna relatório detalhado da operação

**Endpoints:**
```
POST /admin/transfers/batch-collect
Authorization: Bearer <admin-token>

Response:
{
  "success": true,
  "summary": {
    "totalAddresses": 25,
    "maticDistributed": "1.25",
    "tokensTransferred": {
      "USDC": "5000.00",
      "USDT": "2500.00",
      "MATIC": "500.00"
    },
    "maticRecovered": "0.85",
    "totalGasCost": "0.45 MATIC",
    "transactionsUpdated": 73
  },
  "details": [...],
  "errors": [...]
}
```

**Regras de Negócio:**
- Apenas admins podem executar
- Verifica se global wallet tem MATIC suficiente antes de iniciar (mínimo 5 MATIC)
- **MATIC só é enviado para endereços que TÊM tokens ERC20** (USDC, USDT, etc)
- Endereços com apenas MATIC nativo NÃO recebem MATIC (não precisam de gas ERC20)
- Verifica MATIC existente antes de enviar (economiza gas)
- Deixa 0.001 MATIC de reserva em cada endereço
- Se falhar em algum endereço, continua com os próximos
- Log completo de cada operação em `AdminLog`
- Pode ser executado manualmente ou via cron (futuro)

---

### F2: Sistema de Saques

**Descrição:** Usuários podem solicitar saque de seus fundos. Admin aprova e sistema processa automaticamente.

**Critérios de Aceitação:**
- ✅ Usuário pode solicitar saque (especificar token, valor, endereço destino)
- ✅ Validações: saldo suficiente, endereço válido, valor mínimo
- ✅ Saque fica com status `PENDING_APPROVAL`
- ✅ Admin pode aprovar ou rejeitar
- ✅ **Após aprovação, usuário recebe notificação de autorização**
- ✅ Sistema transfere da Global Wallet → endereço do usuário
- ✅ **Usuário recebe notificação de conclusão (com txHash)**
- ✅ **Se rejeitado, usuário recebe notificação com motivo**
- ✅ Atualiza saldo do usuário
- ✅ Registra hash da transação

**Endpoints:**
```
# Usuário solicita saque
POST /user/withdrawals/request
{
  "tokenSymbol": "USDC",
  "amount": "500.00",
  "destinationAddress": "0x..."
}

# Usuário lista seus saques
GET /user/withdrawals

# Usuário consulta notificações de saque
GET /user/withdrawals/:id/status

# Admin lista todos os saques pendentes
GET /admin/withdrawals?status=PENDING_APPROVAL

# Admin aprova saque (envia notificação ao usuário)
POST /admin/withdrawals/:id/approve
Response:
{
  "success": true,
  "withdrawal": {...},
  "notificationSent": true,
  "message": "Withdrawal approved and user notified"
}

# Admin rejeita saque (envia notificação ao usuário)
POST /admin/withdrawals/:id/reject
{
  "reason": "Saldo insuficiente"
}
Response:
{
  "success": true,
  "withdrawal": {...},
  "notificationSent": true,
  "message": "Withdrawal rejected and user notified"
}

# Admin retenta saque que falhou (apenas erros recuperáveis)
POST /admin/withdrawals/:id/retry
Response:
{
  "success": true,
  "withdrawalId": "uuid",
  "message": "Withdrawal retry initiated"
}
```

**Regras de Negócio:**
- **Saque mínimo: $500 USD**
- Taxa de saque: configurável (ex: $5 fixo ou 1%)
- Verifica se global wallet tem saldo suficiente
- Apenas 1 saque pendente por vez por usuário
- Após aprovação, processamento automático
- **Sistema de Retry para Falhas:**
  - Erros RECUPERÁVEIS (sem gas, sem saldo): saldo fica locked, admin pode retry
  - Erros PERMANENTES (endereço inválido): saldo devolvido automaticamente
  - Apenas saques FAILED podem ser retried
- Usuário não pode cancelar após aprovação

---

### F3: Dashboard Administrativo

**Descrição:** Painel web simples para admins gerenciarem a plataforma.

**Critérios de Aceitação:**
- ✅ Login de admin separado (role-based)
- ✅ Estatísticas gerais (total usuários, depósitos, saques)
- ✅ Lista de usuários (com filtros e busca)
- ✅ Detalhes de cada usuário (saldo, transações, status)
- ✅ Gestão de saques (aprovar/rejeitar)
- ✅ Executar batch transfer
- ✅ Ver saldo da Global Wallet
- ✅ Logs de operações críticas

**Endpoints:**
```
# Estatísticas
GET /admin/stats

# Usuários
GET /admin/users?page=1&limit=20&search=email

# Detalhes de usuário
GET /admin/users/:id

# Bloquear/desbloquear usuário
POST /admin/users/:id/block
POST /admin/users/:id/unblock

# Global Wallet
GET /admin/wallet/balance
GET /admin/wallet/transactions

# Logs
GET /admin/logs?type=TRANSFER&date=2025-10-21
```

**Regras de Negócio:**
- Apenas usuários com `role: ADMIN` podem acessar
- Logs de todas as ações de admin
- Não pode deletar usuários (apenas bloquear)
- Dashboard pode ser React/Next.js (frontend separado) ou server-side rendered

---

### F4: Otimizações e Segurança

**Descrição:** Melhorias de performance, segurança e monitoramento.

**Critérios de Aceitação:**

**Rate Limiting:**
- ✅ 100 req/15min por IP em rotas públicas
- ✅ 1000 req/15min em rotas autenticadas
- ✅ 10 req/min em rotas de saque/transferência

**Validações:**
- ✅ Endereço Polygon válido (checksum)
- ✅ Valor numérico positivo
- ✅ Token suportado

**Monitoramento:**
- ✅ Log estruturado (Pino/Winston)
- ✅ Métricas de latência
- ✅ Alertas para erros críticos
- ✅ Health check endpoint

**Backup:**
- ✅ Backup automático do banco
- ✅ Backup das private keys (encrypted)

---

## ❌ Fora do Escopo v2.0

### Funcionalidades para v3.0+
- ❌ Sistema MLM (comissões, indicações, árvore genealógica)
- ❌ Notificações push/email
- ❌ Suporte a múltiplas blockchains
- ❌ Exchange interno (swap de tokens)
- ❌ Staking/Rendimentos
- ❌ App mobile (React Native)

---

## 🔧 Especificações Técnicas

### Novos Models Prisma

```prisma
enum WithdrawalStatus {
  PENDING_APPROVAL
  APPROVED
  PROCESSING
  COMPLETED
  REJECTED
  FAILED
}

model Withdrawal {
  id                  String           @id @default(uuid())
  userId              String
  tokenSymbol         String
  tokenAddress        String?
  amount              Decimal          @db.Decimal(20, 8)
  destinationAddress  String
  fee                 Decimal          @db.Decimal(20, 8)
  status              WithdrawalStatus @default(PENDING_APPROVAL)
  txHash              String?          @unique
  approvedBy          String?          // Admin userId
  approvedAt          DateTime?
  rejectedReason      String?
  processedAt         DateTime?
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@map("withdrawals")
}

model AdminLog {
  id        String   @id @default(uuid())
  adminId   String
  action    String   // "APPROVE_WITHDRAWAL", "BATCH_TRANSFER", etc
  entityId  String?  // ID do withdrawal, user, etc
  details   Json?    // Detalhes adicionais
  createdAt DateTime @default(now())

  @@map("admin_logs")
}

enum NotificationType {
  WITHDRAWAL_APPROVED
  WITHDRAWAL_REJECTED
  WITHDRAWAL_COMPLETED
  WITHDRAWAL_FAILED
}

model WithdrawalNotification {
  id           String           @id @default(uuid())
  userId       String
  withdrawalId String
  type         NotificationType
  title        String           // "Saque Aprovado!"
  message      String           // "Seu saque de 500 USDC foi aprovado pelo administrador"
  data         Json?            // Dados adicionais (txHash, motivo rejeição, etc)
  read         Boolean          @default(false)
  createdAt    DateTime         @default(now())

  user       User       @relation(fields: [userId], references: [id])
  withdrawal Withdrawal @relation(fields: [withdrawalId], references: [id])

  @@index([userId, read]) // Para query de notificações não lidas
  @@map("withdrawal_notifications")
}

// Adicionar ao User model:
model User {
  // ... campos existentes ...
  role      String   @default("user") // "user" ou "admin" (Better Auth já suporta)

  withdrawals              Withdrawal[]
  withdrawalNotifications  WithdrawalNotification[]
}

// Adicionar ao Withdrawal model:
model Withdrawal {
  // ... campos existentes ...
  notifications WithdrawalNotification[]
}
```

---

### Arquitetura de Saldo: Balance vs WalletTransaction

**Decisão Arquitetural:** A partir do v2.0, implementamos uma tabela separada `Balance` para armazenar saldos, mantendo `WalletTransaction` apenas como histórico/auditoria.

#### Problema com Arquitetura Atual (v1.0)

No v1.0, o saldo é calculado dinamicamente a cada consulta:

```typescript
// GET /user/balance → SELECT todas transactions → SUM por token
const transactions = await prisma.walletTransaction.findMany({
  where: { userId, status: { in: ["CONFIRMED", "SENT_TO_GLOBAL"] } }
});

// Agrupa e soma (O(n) a cada consulta)
for (const tx of transactions) {
  if (tx.type === "CREDIT") balance += tx.amount;
  else balance -= tx.amount;
}
```

**Problemas:**
1. ❌ **Performance** - Query pesada a cada consulta de saldo
2. ❌ **Escala mal** - 1000 transações = 1000 rows para somar
3. ❌ **Validação complexa** - Difícil prevenir saldo negativo
4. ❌ **Race conditions** - Validação de saque pode ter conflitos
5. ❌ **Sem locking natural** - Precisa implementar manualmente

#### Nova Arquitetura (v2.0)

**Balance Model:**

```prisma
model Balance {
  id               String   @id @default(uuid())
  userId           String
  tokenSymbol      String
  tokenAddress     String?
  availableBalance Decimal  @db.Decimal(20, 8) // Saldo disponível
  lockedBalance    Decimal  @db.Decimal(20, 8) @default(0) // Saques pendentes
  updatedAt        DateTime @updatedAt
  createdAt        DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, tokenSymbol])
  @@index([userId])
  @@map("user_balances")
}

// Adicionar ao User model:
model User {
  // ... campos existentes ...
  balances Balance[]
}
```

**Vantagens:**
1. ✅ **Performance** - Saldo já calculado (SELECT direto)
2. ✅ **Validação simples** - `WHERE availableBalance >= amount`
3. ✅ **Row-level locking** - PostgreSQL impede conflitos automaticamente
4. ✅ **Saldo bloqueado** - Saques pendentes "reservam" valor
5. ✅ **Auditoria preservada** - WalletTransaction continua existindo

#### Sincronização: Transaction → Balance

**Toda operação que cria transação DEVE atualizar saldo atomicamente:**

```typescript
// Depósito confirmado
await prisma.$transaction([
  // 1. Cria transação (histórico)
  prisma.walletTransaction.create({
    data: {
      userId,
      type: "CREDIT",
      amount: 100,
      tokenSymbol: "USDC",
      status: "CONFIRMED",
      ...
    }
  }),

  // 2. Atualiza saldo (upsert = cria se não existir)
  prisma.balance.upsert({
    where: {
      userId_tokenSymbol: { userId, tokenSymbol: "USDC" }
    },
    create: {
      userId,
      tokenSymbol: "USDC",
      availableBalance: 100,
      lockedBalance: 0
    },
    update: {
      availableBalance: { increment: 100 }
    }
  })
]);
```

**Saque solicitado (reserva saldo):**

```typescript
await prisma.$transaction([
  // 1. Cria withdrawal
  prisma.withdrawal.create({
    data: { userId, amount: 50, tokenSymbol: "USDC", ... }
  }),

  // 2. Move de available → locked
  prisma.balance.update({
    where: { userId_tokenSymbol: { userId, tokenSymbol: "USDC" } },
    data: {
      availableBalance: { decrement: 50 },
      lockedBalance: { increment: 50 }
    }
  })
]);
```

**Saque aprovado e processado:**

```typescript
await prisma.$transaction([
  // 1. Cria transação DEBIT (histórico)
  prisma.walletTransaction.create({
    data: {
      userId,
      type: "DEBIT",
      amount: 50,
      tokenSymbol: "USDC",
      status: "CONFIRMED",
      txHash: blockchainTxHash
    }
  }),

  // 2. Remove de locked (saldo já foi decrementado quando solicitou)
  prisma.balance.update({
    where: { userId_tokenSymbol: { userId, tokenSymbol: "USDC" } },
    data: {
      lockedBalance: { decrement: 50 }
    }
  }),

  // 3. Atualiza withdrawal
  prisma.withdrawal.update({
    where: { id: withdrawalId },
    data: { status: "COMPLETED", txHash: blockchainTxHash }
  })
]);
```

**Saque rejeitado (devolve saldo):**

```typescript
await prisma.$transaction([
  prisma.withdrawal.update({
    where: { id: withdrawalId },
    data: { status: "REJECTED", rejectedReason: "..." }
  }),

  // Devolve locked → available
  prisma.balance.update({
    where: { userId_tokenSymbol: { userId, tokenSymbol } },
    data: {
      availableBalance: { increment: amount },
      lockedBalance: { decrement: amount }
    }
  })
]);
```

#### Validações com Balance

**Prevenir saldo negativo:**

```typescript
// Antes de criar withdrawal
const balance = await prisma.balance.findUnique({
  where: { userId_tokenSymbol: { userId, tokenSymbol } }
});

if (!balance || balance.availableBalance.lt(amount)) {
  throw new Error("INSUFFICIENT_BALANCE");
}

// Atomicamente no transaction:
const updated = await tx.userBalance.updateMany({
  where: {
    userId_tokenSymbol: { userId, tokenSymbol },
    availableBalance: { gte: amount } // Só atualiza se tiver saldo
  },
  data: {
    availableBalance: { decrement: amount },
    lockedBalance: { increment: amount }
  }
});

if (updated.count === 0) {
  throw new Error("INSUFFICIENT_BALANCE"); // Race condition evitada!
}
```

#### GET /user/balance (v2.0)

**Novo endpoint otimizado:**

```typescript
// SELECT direto na tabela user_balances
const balances = await prisma.balance.findMany({
  where: { userId },
  select: {
    tokenSymbol: true,
    tokenAddress: true,
    availableBalance: true,
    lockedBalance: true
  }
});

// Calcula total USD
const totalUSD = await calculateTotalUSD(balances);

return {
  balances: balances.map(b => ({
    tokenSymbol: b.tokenSymbol,
    available: b.availableBalance,
    locked: b.lockedBalance,
    total: b.availableBalance.add(b.lockedBalance)
  })),
  totalUSD
};
```

**Response:**

```json
{
  "balances": [
    {
      "tokenSymbol": "USDC",
      "available": "100.00",
      "locked": "50.00",
      "total": "150.00"
    },
    {
      "tokenSymbol": "MATIC",
      "available": "25.50",
      "locked": "0.00",
      "total": "25.50"
    }
  ],
  "totalUSD": 175.50
}
```

#### Auditoria e Reconciliação

**WalletTransaction continua sendo source of truth para auditoria:**

```typescript
// Script de reconciliação (rodar periodicamente)
async function reconcileBalances() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    // Calcula saldo "verdadeiro" das transações
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: user.id }
    });

    const calculatedBalance = transactions.reduce((acc, tx) => {
      if (tx.type === "CREDIT") return acc.add(tx.amount);
      else return acc.sub(tx.amount);
    }, new Decimal(0));

    // Compara com Balance
    const storedBalance = await prisma.balance.findUnique({
      where: { userId_tokenSymbol: { userId: user.id, tokenSymbol: "USDC" } }
    });

    const total = storedBalance.availableBalance.add(storedBalance.lockedBalance);

    if (!total.equals(calculatedBalance)) {
      console.error(`⚠️  DESYNC: User ${user.id} - Expected ${calculatedBalance}, Got ${total}`);
      // Alertar admins, investigar
    }
  }
}
```

#### Migration para v2.0

**Passo 1: Criar tabela Balance**

```bash
npx prisma migrate dev --name add_user_balance
```

**Passo 2: Popular com saldos existentes**

```typescript
// scripts/migrate-to-user-balance.ts
async function migrateBalances() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    const transactions = await prisma.walletTransaction.findMany({
      where: {
        userId: user.id,
        status: { in: ["CONFIRMED", "SENT_TO_GLOBAL"] }
      }
    });

    // Agrupa por token
    const balances = new Map<string, Decimal>();
    for (const tx of transactions) {
      const current = balances.get(tx.tokenSymbol) || new Decimal(0);
      if (tx.type === "CREDIT") {
        balances.set(tx.tokenSymbol, current.add(tx.amount));
      } else {
        balances.set(tx.tokenSymbol, current.sub(tx.amount));
      }
    }

    // Cria Balance
    for (const [tokenSymbol, balance] of balances) {
      await prisma.balance.create({
        data: {
          userId: user.id,
          tokenSymbol,
          availableBalance: balance,
          lockedBalance: 0
        }
      });
    }

    console.log(`✅ Migrated balances for user ${user.id}`);
  }
}
```

**Passo 3: Atualizar código**

- ✅ Modificar `process-moralis-webhook.ts` para atualizar Balance
- ✅ Modificar `get-user-balance.ts` para ler de Balance
- ✅ Criar lógica de withdrawal com locking
- ✅ Adicionar reconciliação periódica

---

### Better Auth - Configuração de Admin

**Descrição:** Better Auth suporta roles nativamente. Vamos usar o campo `role` do User para diferenciar admins de usuários comuns.

#### 1. Configuração do Better Auth com Roles

```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Mudar para true em produção
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // Atualiza a cada 24h
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutos
    },
  },
  // Hook para adicionar role ao session
  async onSession(session) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    return {
      ...session,
      user: {
        ...session.user,
        role: user?.role || "user",
      },
    };
  },
});
```

#### 2. Middleware de Admin

**Arquivo:** `src/middlewares/admin.middleware.ts`

```typescript
import { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "@/lib/auth";

/**
 * Middleware que verifica se o usuário está autenticado E é admin
 */
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Extrai session do cookie/header
    const session = await auth.api.getSession({
      headers: request.headers as any,
    });

    if (!session) {
      return reply.status(401).send({
        error: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    // Busca usuário completo do banco
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return reply.status(401).send({
        error: "USER_NOT_FOUND",
        message: "User not found",
      });
    }

    // Verifica se é admin
    if (user.role !== "admin") {
      return reply.status(403).send({
        error: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    // Verifica se admin está bloqueado
    if (user.status === "BLOCKED") {
      return reply.status(403).send({
        error: "ACCOUNT_BLOCKED",
        message: "Your admin account has been blocked",
      });
    }

    // Adiciona user completo no request para uso nos controllers
    request.user = user;
  } catch (error) {
    request.log.error({ error }, "Admin authentication error");
    return reply.status(401).send({
      error: "AUTHENTICATION_ERROR",
      message: "Failed to authenticate admin",
    });
  }
}
```

#### 3. Middleware de Autenticação Normal (já existe)

**Arquivo:** `src/middlewares/auth.middleware.ts`

```typescript
import { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "@/lib/auth";

/**
 * Middleware que verifica se o usuário está autenticado (qualquer role)
 */
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    });

    if (!session) {
      return reply.status(401).send({
        error: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return reply.status(401).send({
        error: "USER_NOT_FOUND",
        message: "User not found",
      });
    }

    if (user.status === "BLOCKED") {
      return reply.status(403).send({
        error: "ACCOUNT_BLOCKED",
        message: "Your account has been blocked",
      });
    }

    request.user = user;
  } catch (error) {
    request.log.error({ error }, "Authentication error");
    return reply.status(401).send({
      error: "AUTHENTICATION_ERROR",
      message: "Failed to authenticate",
    });
  }
}
```

#### 4. Type Definitions para Request

**Arquivo:** `src/types/fastify.d.ts`

```typescript
import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      name: string;
      role: string;
      status: string;
    };
  }
}
```

#### 5. Exemplo de Uso em Rotas Admin

**Arquivo:** `src/modules/admin/routes.ts`

```typescript
import { FastifyInstance } from "fastify";
import { requireAdmin } from "@/middlewares/admin.middleware";
import { getStatsController } from "./controllers/get-stats-controller";
import { listUsersController } from "./controllers/list-users-controller";
import { blockUserController } from "./controllers/block-user-controller";

export async function adminRoutes(app: FastifyInstance) {
  // TODAS as rotas admin usam o middleware requireAdmin
  app.addHook("onRequest", requireAdmin);

  // Estatísticas
  app.get("/stats", getStatsController);

  // Gestão de usuários
  app.get("/users", listUsersController);
  app.get("/users/:id", getUserDetailsController);
  app.post("/users/:id/block", blockUserController);
  app.post("/users/:id/unblock", unblockUserController);

  // Saques
  app.get("/withdrawals", listAllWithdrawalsController);
  app.post("/withdrawals/:id/approve", approveWithdrawalController);
  app.post("/withdrawals/:id/reject", rejectWithdrawalController);

  // Transfers
  app.post("/transfers/batch-collect", batchCollectController);

  // Global Wallet
  app.get("/wallet/balance", getGlobalBalanceController);
  app.get("/wallet/transactions", getGlobalTransactionsController);

  // Logs
  app.get("/logs", getAdminLogsController);
}
```

#### 6. Exemplo de Controller Admin

**Arquivo:** `src/modules/admin/controllers/approve-withdrawal-controller.ts`

```typescript
import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { approveWithdrawal } from "../use-cases/approve-withdrawal";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function approveWithdrawalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // request.user já está disponível graças ao middleware requireAdmin
    const adminId = request.user!.id; // Sabemos que existe por causa do middleware

    const { id: withdrawalId } = paramsSchema.parse(request.params);

    const result = await approveWithdrawal({
      withdrawalId,
      adminId, // Passa o ID do admin que aprovou
    });

    return reply.status(200).send({
      success: true,
      withdrawal: result.withdrawal,
      notificationSent: result.notificationSent,
      message: "Withdrawal approved and user notified",
    });
  } catch (error) {
    request.log.error({ error }, "Error approving withdrawal");

    if (error instanceof Error) {
      return reply.status(400).send({
        error: "APPROVAL_FAILED",
        message: error.message,
      });
    }

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to approve withdrawal",
    });
  }
}
```

#### 7. Como Criar Administradores

**IMPORTANTE: Admins são criados APENAS manualmente por segurança.**

Não existe rota de signup para admins. Eles devem ser criados diretamente no banco de dados.

**Fluxo de Criação:**

1. Usuário cria conta normal via `/api/auth/sign-up` (frontend)
2. DBA/Desenvolvedor promove esse usuário para admin

---

### Desenvolvimento

**Opção 1: Seed Script (Recomendado - cria 4 admins)**

```bash
npx tsx prisma/seed-admins.ts
```

**Admins criados:**
- `alpha@admin.com` - Nome: Alpha - Senha: `Admin@2025`
- `bravo@admin.com` - Nome: Bravo - Senha: `Admin@2025`
- `charlie@admin.com` - Nome: Charlie - Senha: `Admin@2025`
- `delta@admin.com` - Nome: Delta - Senha: `Admin@2025`

⚠️ **Trocar senhas em produção!**

**Opção 2: Prisma Studio (Permitido em dev)**

```bash
npx prisma studio
```

1. Navegue até a tabela `users`
2. Encontre o usuário que será admin
3. Edite o campo `role` de `"user"` para `"admin"`
4. Salve as mudanças

**Opção 3: SQL Direto via psql**

```bash
psql -U postgres -d mvppir
```

```sql
UPDATE users
SET role = 'admin', status = 'ACTIVE'
WHERE email = 'admin@example.com'
RETURNING id, email, role, status;
```

---

### Produção

**NUNCA use Prisma Studio em produção** (não deve estar disponível).

**Método ÚNICO: SQL Direto via SSH**

```bash
# 1. SSH no servidor de produção
ssh user@production-server

# 2. Conecta no banco PostgreSQL
psql $DATABASE_URL

# 3. Promove usuário para admin
UPDATE users
SET role = 'admin', status = 'ACTIVE'
WHERE email = 'admin@empresa.com'
RETURNING id, email, role, status, "createdAt";

# 4. Verifica
SELECT id, email, role, status FROM users WHERE role = 'admin';

# 5. Sai
\q
```

**Alternativa: Cliente PostgreSQL Remoto**

Use **pgAdmin**, **DBeaver** ou **TablePlus** conectando remotamente no banco:

```sql
UPDATE users
SET role = 'admin', status = 'ACTIVE'
WHERE email = 'admin@empresa.com'
RETURNING id, email, role, status;
```

---

### Regras de Segurança

- ❌ **NÃO** criar rota `/api/auth/admin-signup`
- ❌ **NÃO** permitir auto-promoção via API
- ❌ **NÃO** expor Prisma Studio em produção
- ✅ Apenas DBAs/Desenvolvedores podem criar admins
- ✅ Usar SQL direto em produção
- ✅ Documentar quem criou cada admin (logs SSH)
- ✅ Sempre usar `RETURNING` para confirmar operação
- 💡 Email não precisa existir/ser válido (é apenas identificador)

---

### Scripts Úteis

**Listar todos os admins:**

```sql
SELECT
  id,
  email,
  name,
  role,
  status,
  "createdAt",
  "activatedAt"
FROM users
WHERE role = 'admin'
ORDER BY "createdAt" DESC;
```

**Remover permissão de admin (rebaixar para user):**

```sql
UPDATE users
SET role = 'user'
WHERE email = 'ex-admin@example.com'
RETURNING id, email, role;
```

---

### Implementação do Seeder de Admins

**Arquivo:** `prisma/seed-admins.ts`

Cria 4 admins com codinomes @admin.com para desenvolvimento.

```typescript
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

const ADMIN_ACCOUNTS = [
  { email: "alpha@admin.com", name: "Alpha" },
  { email: "bravo@admin.com", name: "Bravo" },
  { email: "charlie@admin.com", name: "Charlie" },
  { email: "delta@admin.com", name: "Delta" },
];

const DEFAULT_PASSWORD = "Admin@2025";

async function main() {
  console.log("🔐 Creating admin accounts...\n");

  const hashedPassword = await hash(DEFAULT_PASSWORD, 10);

  for (const admin of ADMIN_ACCOUNTS) {
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        name: admin.name,
        role: "admin",
        status: "ACTIVE",
        emailVerified: true,
        accounts: {
          create: {
            accountId: `${admin.name.toLowerCase()}-account`,
            providerId: "credential",
            password: hashedPassword,
          },
        },
      },
    });

    console.log(`✅ ${admin.email} (${admin.name})`);
  }

  console.log("\n🎉 All admin accounts created!");
  console.log(`📧 Default password: ${DEFAULT_PASSWORD}`);
  console.log("⚠️  Remember to change passwords in production!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Executar:**

```bash
npx tsx prisma/seed-admins.ts
```

**Package.json script (opcional):**

```json
{
  "scripts": {
    "seed:admins": "tsx prisma/seed-admins.ts"
  }
}
```

Então pode rodar: `npm run seed:admins`

#### 8. Logging de Ações Admin

**Todas as ações críticas de admin devem ser logadas:**

```typescript
// src/lib/admin-logger.ts
import { prisma } from "./prisma";

export async function logAdminAction({
  adminId,
  action,
  entityId,
  details,
}: {
  adminId: string;
  action: string;
  entityId?: string;
  details?: Record<string, any>;
}) {
  await prisma.adminLog.create({
    data: {
      adminId,
      action,
      entityId,
      details: details ? JSON.parse(JSON.stringify(details)) : null,
    },
  });

  console.log(`🔒 Admin Action: ${action} by ${adminId}`, {
    entityId,
    details,
  });
}
```

**Uso:**

```typescript
// Após aprovar um saque
await logAdminAction({
  adminId: request.user.id,
  action: "APPROVE_WITHDRAWAL",
  entityId: withdrawalId,
  details: {
    amount: withdrawal.amount.toString(),
    tokenSymbol: withdrawal.tokenSymbol,
    userId: withdrawal.userId,
  },
});
```

#### 9. Proteção Extra: Rate Limiting Admin

**Mesmo admins devem ter rate limiting:**

```typescript
// src/plugins/rate-limit.plugin.ts
import rateLimit from "@fastify/rate-limit";

export async function rateLimitPlugin(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: 100, // Requisições
    timeWindow: '15 minutes',

    // Rate limit específico para admins
    keyGenerator: (request) => {
      const user = request.user;
      if (user?.role === 'admin') {
        return `admin:${user.id}`;
      }
      return request.ip;
    },
  });
}
```

---

### Setup da Global Wallet (v2.0)

**Descrição:** A Global Wallet é a carteira central que recebe todos os tokens dos usuários via batch transfers e processa os saques.

No v1.0, a Global Wallet existe no banco mas **não é usada**. No v2.0, ela se torna **crítica** para o sistema.

#### Por que precisamos da Global Wallet?

1. **Batch Transfers** - Centraliza fundos de múltiplos endereços (reduz custo de gas)
2. **Withdrawals** - Processa saques de usuários a partir de um único endereço
3. **Liquidez** - Mantém saldo de MATIC para pagar gas das transferências

#### Como Criar e Configurar

**Arquivo:** `scripts/create-global-wallet.ts`

Script helper que gera a wallet, encripta a private key e mostra como adicionar no `.env`.

```typescript
import { Wallet } from "ethers";
import { encryptPrivateKey } from "../src/lib/encryption";
import { prisma } from "../src/lib/prisma";

async function createGlobalWallet() {
  console.log("🔐 Creating Global Wallet...\n");

  // 1. Gera wallet aleatória
  const wallet = Wallet.createRandom();

  console.log("✅ Wallet generated!");
  console.log(`📍 Address: ${wallet.address}`);
  console.log(`🔑 Private Key (RAW): ${wallet.privateKey}\n`);

  // 2. Encripta private key
  const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey);

  console.log("🔒 Private Key encrypted!");
  console.log(`🔐 Encrypted: ${encryptedPrivateKey}\n`);

  // 3. Salva no banco de dados
  const globalWallet = await prisma.globalWallet.create({
    data: {
      polygonAddress: wallet.address.toLowerCase(),
      privateKey: encryptedPrivateKey,
    },
  });

  console.log("💾 Global Wallet saved to database!");
  console.log(`🆔 Database ID: ${globalWallet.id}\n`);

  // 4. Instruções finais
  console.log("✅ Global Wallet configurada com sucesso!\n");

  console.log("📋 Próximos passos:\n");
  console.log("1. Fund this address with MATIC for gas fees:");
  console.log(`   ${wallet.address}\n`);
  console.log("2. Recommended: 10-50 MATIC to start\n");

  console.log("🔐 Segurança:");
  console.log("✅ Private key armazenada ENCRIPTADA no banco");
  console.log("✅ ENCRYPTION_KEY necessária para descriptografar (está no .env)");
  console.log("✅ Atacante precisa comprometer banco + .env\n");

  console.log("⚠️  IMPORTANTE:");
  console.log("1. Backup do banco = backup da Global Wallet");
  console.log("2. NUNCA compartilhe a ENCRYPTION_KEY");
  console.log("3. Em produção, considere hardware wallet ou multi-sig\n");

  console.log("✨ Setup completo!");
}

createGlobalWallet()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Executar:**

```bash
npx tsx scripts/create-global-wallet.ts
```

**Saída esperada:**

```
🔐 Creating Global Wallet...

✅ Wallet generated!
📍 Address: 0x1234567890abcdef1234567890abcdef12345678
🔑 Private Key (RAW): 0xabcdef...

🔒 Private Key encrypted!
🔐 Encrypted: U2FsdGVkX1...

💾 Global Wallet saved to database!
🆔 Database ID: uuid-here

✅ Global Wallet configurada com sucesso!

📋 Próximos passos:

1. Fund this address with MATIC for gas fees:
   0x1234567890abcdef1234567890abcdef12345678

2. Recommended: 10-50 MATIC to start

🔐 Segurança:
✅ Private key armazenada ENCRIPTADA no banco
✅ ENCRYPTION_KEY necessária para descriptografar (está no .env)
✅ Atacante precisa comprometer banco + .env

⚠️  IMPORTANTE:
1. Backup do banco = backup da Global Wallet
2. NUNCA compartilhe a ENCRYPTION_KEY
3. Em produção, considere hardware wallet ou multi-sig

✨ Setup completo!
```

#### Funding da Global Wallet

Após criar a Global Wallet, você **DEVE** enviar MATIC para ela:

```bash
# 1. Copie o endereço da Global Wallet
echo $GLOBAL_WALLET_ADDRESS

# 2. Envie MATIC via MetaMask ou exchange
# Recomendado: 10-50 MATIC para começar
```

**Por que precisa de MATIC?**
- Pagar gas das transferências em lote
- Pagar gas dos saques de usuários
- Sem MATIC = sistema travado ⚠️

#### Verificar Saldo da Global Wallet

```typescript
// GET /admin/wallet/balance
{
  "address": "0x1234...",
  "balances": {
    "MATIC": "25.5",
    "USDC": "10000.00",
    "USDT": "5000.00"
  },
  "totalUSD": "15025.50"
}
```

#### Package.json script (opcional):

```json
{
  "scripts": {
    "setup:global-wallet": "tsx scripts/create-global-wallet.ts"
  }
}
```

#### Como Usar a Global Wallet no Código

**Buscar do banco e descriptografar quando necessário:**

```typescript
// src/modules/wallet/use-cases/get-global-wallet.ts
import { prisma } from "@/lib/prisma";
import { decryptPrivateKey } from "@/lib/encryption";
import { Wallet, JsonRpcProvider } from "ethers";

export async function getGlobalWallet() {
  // 1. Busca do banco
  const globalWallet = await prisma.globalWallet.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  if (!globalWallet) {
    throw new Error("Global Wallet not found in database");
  }

  // 2. Descriptografa private key
  const privateKey = decryptPrivateKey(globalWallet.privateKey);

  // 3. Cria instância do Wallet
  const provider = new JsonRpcProvider(process.env.POLYGON_RPC_URL);
  const wallet = new Wallet(privateKey, provider);

  return {
    address: globalWallet.polygonAddress,
    wallet, // Pronta para usar (enviar transações)
  };
}
```

**Exemplo de uso (batch transfer):**

```typescript
// src/modules/transfer/use-cases/batch-collect-to-global.ts
import { getGlobalWallet } from "@/modules/wallet/use-cases/get-global-wallet";

export async function batchCollectToGlobal() {
  // Obtém Global Wallet do banco
  const { wallet: globalWallet, address } = await getGlobalWallet();

  // Usa para enviar MATIC, processar saques, etc
  const tx = await globalWallet.sendTransaction({
    to: userAddress,
    value: parseEther("0.1"),
  });

  await tx.wait();
}
```

#### Segurança da Global Wallet

⚠️ **CRÍTICO: Esta wallet controla TODOS os fundos da plataforma!**

**Proteções Implementadas:**
- ✅ Private key **encriptada no banco** (AES-256-GCM)
- ✅ ENCRYPTION_KEY separada no .env (segurança em camadas)
- ✅ Atacante precisa comprometer **banco + .env**
- ✅ Apenas admins podem ver saldo
- ✅ Apenas admins podem executar transfers/withdrawals
- ✅ Monitoramento 24/7 de transações suspeitas
- ✅ Rate limiting em rotas de saque/transfer
- ✅ Logs de todas as operações (AdminLog)
- ✅ Backup automático do banco = backup da wallet

**Recomendações para Produção:**
- 🔐 Usar hardware wallet (Ledger/Trezor)
- 🔐 Multi-sig wallet (Gnosis Safe) para grandes volumes
- 🔐 Cold wallet para reservas (> $100k)
- 🔐 Hot wallet (Global Wallet) apenas com liquidez necessária
- 🔐 Rotação periódica da ENCRYPTION_KEY
- 🔐 Alertas automáticos para movimentações grandes
- 🔐 Auditoria de segurança profissional

---

### Variáveis de Ambiente Adicionais

**IMPORTANTE:** A partir do v2.0, a Global Wallet private key é armazenada **encriptada no banco**, não mais no `.env`.

```env
# Saque
WITHDRAWAL_MIN_USD=500
WITHDRAWAL_FEE_USD=5
WITHDRAWAL_FEE_PERCENT=1

# Rate Limiting
RATE_LIMIT_PUBLIC=100
RATE_LIMIT_AUTHENTICATED=1000
RATE_LIMIT_CRITICAL=10

# Monitoring
SENTRY_DSN="https://..."
LOG_LEVEL=info

# NOTA: GLOBAL_WALLET_ADDRESS e GLOBAL_WALLET_PRIVATE_KEY foram REMOVIDAS
# Agora a Global Wallet é armazenada no banco de dados (tabela global_wallets)
# Apenas a ENCRYPTION_KEY é necessária no .env para descriptografar
```

### Endpoints de Notificação

```
# Usuário lista suas notificações
GET /user/notifications
Response:
{
  "notifications": [
    {
      "id": "uuid",
      "type": "WITHDRAWAL_APPROVED",
      "title": "Saque Aprovado!",
      "message": "Seu saque de 500 USDC foi aprovado",
      "data": { "withdrawalId": "uuid", "amount": "500" },
      "read": false,
      "createdAt": "2025-10-21T10:00:00Z"
    }
  ],
  "unreadCount": 3
}

# Marcar notificação como lida
PATCH /user/notifications/:id/read

# Marcar todas como lidas
PATCH /user/notifications/read-all
```

### Estrutura de Módulos

```
src/modules/
├─ admin/
│  ├─ controllers/
│  │  ├─ get-stats-controller.ts
│  │  ├─ list-users-controller.ts
│  │  ├─ get-user-details-controller.ts
│  │  └─ block-user-controller.ts
│  ├─ use-cases/
│  │  ├─ get-platform-stats.ts
│  │  └─ manage-user-status.ts
│  └─ routes.ts
│
├─ transfer/
│  ├─ controllers/
│  │  └─ batch-collect-controller.ts
│  ├─ use-cases/
│  │  └─ batch-collect-to-global.ts
│  └─ routes.ts
│
├─ withdrawal/
│  ├─ controllers/
│  │  ├─ request-withdrawal-controller.ts
│  │  ├─ list-withdrawals-controller.ts
│  │  ├─ approve-withdrawal-controller.ts
│  │  └─ reject-withdrawal-controller.ts
│  ├─ use-cases/
│  │  ├─ request-withdrawal.ts
│  │  ├─ approve-withdrawal.ts
│  │  ├─ process-withdrawal.ts
│  │  └─ reject-withdrawal.ts
│  ├─ services/
│  │  └─ notification.service.ts  // Envia notificações
│  └─ routes.ts
│
├─ notification/
│  ├─ controllers/
│  │  ├─ list-notifications-controller.ts
│  │  ├─ mark-as-read-controller.ts
│  │  └─ mark-all-read-controller.ts
│  ├─ use-cases/
│  │  ├─ create-notification.ts
│  │  └─ get-user-notifications.ts
│  └─ routes.ts
│
└─ wallet/
   ├─ controllers/
   │  └─ get-global-balance-controller.ts
   ├─ use-cases/
   │  ├─ get-global-wallet-balance.ts
   │  └─ decrypt-private-key.ts
   └─ routes.ts
```

---

## 📊 Métricas de Sucesso

### Métricas de Produto
- ✅ 95% dos saques processados em < 10 minutos
- ✅ 100% dos batch transfers bem-sucedidos
- ✅ Redução de 80% no custo de gas vs transferências individuais
- ✅ 0 saques perdidos ou duplicados

### Métricas Técnicas
- ✅ Admin dashboard load time < 2s
- ✅ Withdrawal approval API < 500ms
- ✅ Batch transfer completa em < 5min para 100 endereços
- ✅ 99.9% uptime

### Métricas de Segurança
- ✅ 0 private keys expostas
- ✅ 100% das ações de admin logadas
- ✅ Rate limiting efetivo (0 ataques bem-sucedidos)

---

## 🚨 Riscos e Mitigações

### Risco 1: Global Wallet Comprometida
**Impacto:** Crítico
**Probabilidade:** Baixa
**Mitigação:**
- Multi-sig wallet (fase futura)
- Monitoramento 24/7
- Limites diários de saque
- Cold wallet para fundos maiores

### Risco 2: Falha no Batch Transfer
**Impacto:** Alto
**Probabilidade:** Média
**Mitigação:**
- Retry automático (3 tentativas)
- Continuar mesmo se alguns falharem
- Alertas imediatos
- Rollback se > 50% falhar

### Risco 3: Saque Processado Duas Vezes
**Impacto:** Alto (perda financeira)
**Probabilidade:** Baixa
**Mitigação (Defense in Depth):**

**Camada 0: Aprovação Manual por Admin (Linha de Frente)**
```typescript
// NENHUM saque é processado automaticamente
// Fluxo obrigatório:
// 1. Usuário solicita → status: PENDING_APPROVAL
// 2. Admin revisa manualmente
// 3. Admin aprova → status: APPROVED
// 4. Sistema processa → status: PROCESSING → COMPLETED

// Vantagens:
// - Humano verifica cada saque antes de processar
// - Admin pode validar: endereço, valor, usuário, histórico
// - Previne fraudes e erros
// - Admin vê se já foi processado antes de aprovar
```

**Camada 1: Lock Pessimista no Banco**
```typescript
// Usa SELECT FOR UPDATE para lock da linha
const withdrawal = await prisma.$transaction(async (tx) => {
  const w = await tx.withdrawal.findUnique({
    where: { id: withdrawalId },
    // Lock pessimista - impede leitura concorrente
  });

  // Verifica status - deve estar APPROVED
  if (w.status !== 'APPROVED') {
    throw new Error('Invalid status for processing');
  }

  // Atualiza para PROCESSING atomicamente
  return tx.withdrawal.update({
    where: { id: withdrawalId },
    data: {
      status: 'PROCESSING',
      processedAt: new Date()
    }
  });
}, {
  isolationLevel: 'Serializable' // Máximo nível de isolamento
});
```

**Camada 2: Status Intermediário**
- `APPROVED` → `PROCESSING` → `COMPLETED`
- Apenas saques com status `APPROVED` podem ser processados
- `PROCESSING` impede reprocessamento

**Camada 3: Verificação de txHash**
```typescript
// Antes de processar, verifica se já existe txHash
if (withdrawal.txHash) {
  throw new Error('Withdrawal already has txHash - already processed');
}

// Após enviar transação blockchain
await prisma.withdrawal.update({
  where: { id: withdrawalId },
  data: {
    txHash: txHash,
    status: 'COMPLETED'
  }
});
```

**Camada 4: processedAt como Lock Natural**
```typescript
// Usa updateMany com WHERE para garantir atomicidade
// Só atualiza se processedAt ainda for null
const updated = await tx.withdrawal.updateMany({
  where: {
    id: withdrawalId,
    status: 'APPROVED',
    processedAt: null,  // Só se ainda não foi processado
    txHash: null,
  },
  data: {
    status: 'PROCESSING',
    processedAt: new Date(),
  }
});

// Se count = 0, significa que já foi processado
if (updated.count === 0) {
  throw new Error('Withdrawal already processed or invalid status');
}

// Nenhuma tabela extra ou Redis necessário!
// O campo processedAt já existe no model Withdrawal
```

**Camada 5: Unique Constraint no Banco**
```prisma
model Withdrawal {
  // ...
  txHash String? @unique // Garante que não pode ter 2 saques com mesmo txHash
}
```

**Camada 6: Rate Limiting por Usuário**
```typescript
// Máximo 1 saque em processamento por usuário
const processing = await prisma.withdrawal.count({
  where: {
    userId: withdrawal.userId,
    status: 'PROCESSING'
  }
});

if (processing > 0) {
  throw new Error('User already has withdrawal being processed');
}
```

**Camada 7: Rastreabilidade - Qual Admin Autorizou**
```typescript
// Quando admin aprova o saque, registra quem autorizou
await prisma.withdrawal.update({
  where: { id: withdrawalId },
  data: {
    status: 'APPROVED',
    approvedBy: adminId,        // ← Registra qual admin aprovou
    approvedAt: new Date(),
  }
});

// Quando processa, verifica quem autorizou
const withdrawal = await prisma.withdrawal.findUnique({
  where: { id: withdrawalId },
  include: {
    user: true,  // Usuário que solicitou
  }
});

// Log completo com rastreabilidade
await prisma.adminLog.create({
  data: {
    adminId: processingAdminId,    // Admin processando
    action: 'PROCESS_WITHDRAWAL',
    entityId: withdrawalId,
    details: {
      approvedBy: withdrawal.approvedBy,  // Admin que aprovou
      approvedAt: withdrawal.approvedAt,
      userId: withdrawal.userId,
      amount: withdrawal.amount.toString(),
      tokenSymbol: withdrawal.tokenSymbol,
    }
  }
});
```

**Camada 8: Auditoria e Alertas**
```typescript
// Alerta se detectar tentativa duplicada
if (isDuplicate) {
  await sendAlert({
    type: 'CRITICAL',
    message: `Duplicate withdrawal processing attempt: ${withdrawalId}`,
    approvedBy: withdrawal.approvedBy,
    processingAttemptBy: adminId,
  });
}

// Notifica admin que aprovou sobre conclusão
await notifyAdmin({
  adminId: withdrawal.approvedBy,
  type: 'WITHDRAWAL_COMPLETED',
  message: `Saque aprovado por você foi processado: ${txHash}`
});
```

---


---

## 📚 Referências

- [PRD v1.0](./PRD-MVP-v1.md)
- [Ethers.js Batch Transactions](https://docs.ethers.org/v6/api/providers/#Provider-sendTransaction)
- [Polygon Gas Optimization](https://docs.polygon.technology/docs/develop/network-details/gas-token/)

---

**Última atualização:** 21/10/2025
**Próxima revisão:** Após conclusão do v2.0
