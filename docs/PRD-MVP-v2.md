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
- Verifica se global wallet tem MATIC suficiente antes de iniciar
- Deixa ~0.01 MATIC de reserva em cada endereço
- Se falhar em algum endereço, continua com os próximos
- Log completo de cada operação
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
```

**Regras de Negócio:**
- **Saque mínimo: $500 USD**
- Taxa de saque: configurável (ex: $5 fixo ou 1%)
- Verifica se global wallet tem saldo suficiente
- Apenas 1 saque pendente por vez por usuário
- Após aprovação, processamento automático
- Se processamento falhar, volta para `PENDING_APPROVAL`
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

### Variáveis de Ambiente Adicionais

```env
# Saque
WITHDRAWAL_MIN_USD=500
WITHDRAWAL_FEE_USD=5
WITHDRAWAL_FEE_PERCENT=1

# Admin
ADMIN_JWT_SECRET="different-from-user-jwt"

# Rate Limiting
RATE_LIMIT_PUBLIC=100
RATE_LIMIT_AUTHENTICATED=1000
RATE_LIMIT_CRITICAL=10

# Monitoring
SENTRY_DSN="https://..."
LOG_LEVEL=info
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

**Camada 4: Idempotency Key**
```typescript
// Gera chave única para cada tentativa de processamento
const idempotencyKey = `withdrawal-${withdrawalId}-${Date.now()}`;

// Armazena em cache (Redis) por 24h
await redis.setex(idempotencyKey, 86400, 'processing');

// Se já existe, rejeita
if (await redis.exists(idempotencyKey)) {
  throw new Error('Duplicate processing attempt');
}
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

**Camada 7: Auditoria e Alertas**
```typescript
// Log toda tentativa de processamento
await prisma.adminLog.create({
  data: {
    adminId: adminId,
    action: 'PROCESS_WITHDRAWAL',
    entityId: withdrawalId,
    details: {
      status: withdrawal.status,
      amount: withdrawal.amount,
      timestamp: new Date()
    }
  }
});

// Alerta se detectar tentativa duplicada
if (isDuplicate) {
  await sendAlert({
    type: 'CRITICAL',
    message: `Duplicate withdrawal processing attempt: ${withdrawalId}`,
    admin: adminId
  });
}
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
