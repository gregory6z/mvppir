# 📊 PRD - Sistema MLM v1.0 (MVP Inicial)

**Projeto:** MVP PIR - Multi-Level Marketing System
**Versão:** 1.0 (MVP Inicial - Simplificado)
**Data:** 2025-10-23
**Status:** Pronto para Implementação

> **Nota:** Esta é a versão simplificada para implementação inicial. A versão completa v3.0 está em `PRD-MLM-v3.0-FULL.md`.

---

## 🎯 Executive Summary

Sistema MLM simplificado focado nas **funcionalidades essenciais** para MVP inicial:

### Características Principais (v1.0)

✅ **4 Ranks:** Recruta → Bronze → Prata → Ouro
✅ **Comissões Diárias:** 0% até 2.60% sobre saldo da rede
✅ **Multi-Nível:** N1, N2, N3 (sem N4 e N5+)
✅ **Downrank de 3 Meses:** Aviso → Temporário → Permanente
✅ **Saldo Bloqueado:** Requisito para manter rank
✅ **Taxas de Saque:** Progressivas por rank

### Removido da v1.0 (Fica para v2.0)

❌ Ranks avançados (Platina, Diamante, Diamante Negro, Imperial)
❌ Gamificação completa (Streaks, Badges, Leaderboards, Missões)
❌ Matching Bonus
❌ Pool Global
❌ Compressão Dinâmica

---

## 🏆 Sistema de Ranks

### Tabela de Ranks (4 apenas)

```
┌────┬──────────┬─────────────┬──────────┬───────────┬─────────────┐
│ #  │ Rank     │ Bloqueado   │ % N1     │ Diretos   │ Volume Vida │
├────┼──────────┼─────────────┼──────────┼───────────┼─────────────┤
│ 1  │ 🎖️ RECRUTA│ $100       │ 0.00%    │ 0         │ -           │
│ 2  │ 🥉 BRONZE│ $500        │ 1.05%    │ 5         │ $2,500      │
│ 3  │ 🥈 PRATA │ $2,000      │ 1.80%    │ 15        │ $30,000     │
│ 4  │ 🥇 OURO  │ $5,000      │ 2.60%    │ 30        │ $150,000    │
└────┴──────────┴─────────────┴──────────┴───────────┴─────────────┘
```

### Comissões Multi-Nível (Simplificado)

```
┌────┬──────────┬──────┬──────┬──────┐
│ #  │ Rank     │ N1   │ N2   │ N3   │
├────┼──────────┼──────┼──────┼──────┤
│ 1  │ 🎖️ RECRUTA│ 0.00%│ -    │ -    │
│ 2  │ 🥉 BRONZE│ 1.05%│ 0.15%│ -    │
│ 3  │ 🥈 PRATA │ 1.80%│ 0.25%│ 0.10%│
│ 4  │ 🥇 OURO  │ 2.60%│ 0.40%│ 0.15%│
└────┴──────────┴──────┴──────┴──────┘
```

### Limites de Profundidade

```
┌────┬──────────┬─────────────┐
│ #  │ Rank     │ Níveis Pagos│
├────┼──────────┼─────────────┤
│ 1  │ 🎖️ RECRUTA│ Nenhum      │
│ 2  │ 🥉 BRONZE│ N1, N2      │
│ 3  │ 🥈 PRATA │ N1, N2, N3  │
│ 4  │ 🥇 OURO  │ N1, N2, N3  │
└────┴──────────┴─────────────┘
```

**Nota:** Ouro ganha de N1, N2, N3 (não tem N4 na v1.0)

---

## 📖 Regras de Conquista

### Como Subir de Rank (Lifetime)

```
┌────┬──────────┬────────────────────────────────────┐
│ #  │ Rank     │ Requisitos (Uma Vez)               │
├────┼──────────┼────────────────────────────────────┤
│ 1  │ 🎖️ RECRUTA│ Cadastro + $100                   │
│ 2  │ 🥉 BRONZE│ 5 diretos + $2.5K vol + $500 blq  │
│ 3  │ 🥈 PRATA │ 15 diretos + $30K vol + $2K blq   │
│ 4  │ 🥇 OURO  │ 30 diretos + $150K vol + $5K blq  │
└────┴──────────┴────────────────────────────────────┘
```

**Definições:**
- **Diretos (lifetime):** Total de pessoas convidadas (nunca diminui)
- **Volume Vida:** Soma de TODOS depósitos da rede (nunca diminui)
- **Saldo Bloqueado:** Valor que deve manter na conta

---

## 🔄 Regras de Manutenção

### Requisitos Mensais

```
┌────┬──────────┬────────────────────────────────┐
│ #  │ Rank     │ Requisitos Mensais             │
├────┼──────────┼────────────────────────────────┤
│ 1  │ 🎖️ RECRUTA│ Saldo ≥ $100                  │
│ 2  │ 🥉 BRONZE│ 3 ativos + $500/mês + $500 blq│
│ 3  │ 🥈 PRATA │ 8 ativos + $6K/mês + $2K blq  │
│ 4  │ 🥇 OURO  │ 15 ativos + $30K/mês + $5K blq│
└────┴──────────┴────────────────────────────────┘
```

**Direto Ativo:**
- Login nos últimos 30 dias
- Saldo ≥ $100
- Status: ACTIVE

**Volume Mensal:**
- Soma de depósitos da rede inteira (N1+N2+N3)
- Reseta dia 1 de cada mês
- Fórmula: `volumeMensalMinimo = volumeConquista × 0.20`

---

## ⚠️ Sistema de Downrank

### Fluxo de 3 Meses

```
MÊS 1: AVISO
├─ Não cumpriu requisitos
├─ Status: "WARNING"
├─ Grace period: 7 dias
└─ Se corrigir → OK, se não → MÊS 2

MÊS 2: DOWNRANK TEMPORÁRIO -1
├─ Status: "TEMPORARY_DOWNRANK"
├─ Perde 1 rank
├─ Pode recuperar
└─ Se não recuperar → MÊS 3

MÊS 3: DOWNRANK PERMANENTE -2
├─ Status: "DOWNRANKED"
├─ Perde 2 ranks do original
├─ Deve reconquistar
└─ Ciclo reseta
```

### Exemplo: Prata → Recruta

```
Janeiro: Prata não cumpre requisitos → AVISO
Fevereiro: Bronze temporário (-1)
Março: Recruta permanente (-2)
```

---

## 💰 Sistema de Comissões

### Cálculo Diário

```typescript
comissaoDiaria = saldoReferido × percentualNivel

// Exemplo: Bronze com 5 N1 de $500 cada
comissaoN1 = 5 × $500 × 1.05% = $26.25/dia
```

### Exemplo Completo: Ouro

```
Rede:
├─ 30 N1 com $1,000 cada = $30,000
├─ 150 N2 com $500 cada = $75,000
└─ 500 N3 com $300 cada = $150,000

Comissões:
├─ N1: $30,000 × 2.60% = $780/dia
├─ N2: $75,000 × 0.40% = $300/dia
├─ N3: $150,000 × 0.15% = $225/dia
└─ TOTAL: $1,305/dia = $476,325/ano
```

---

## 💸 Sistema de Taxas de Saque

### Taxa Base por Rank

```
┌────┬──────────┬────────────┬──────────┬────────────┐
│ #  │ Rank     │ Taxa Base  │ Cooldown │ Limite/Dia │
├────┼──────────┼────────────┼──────────┼────────────┤
│ 1  │ 🎖️ RECRUTA│ 15%       │ 7 dias   │ $500       │
│ 2  │ 🥉 BRONZE│ 12%        │ 5 dias   │ $1,000     │
│ 3  │ 🥈 PRATA │ 10%        │ 3 dias   │ $2,500     │
│ 4  │ 🥇 OURO  │ 8%         │ 2 dias   │ $5,000     │
└────┴──────────┴────────────┴──────────┴────────────┘
```

### Taxa Progressiva (Frequência)

```
1º saque do mês: +0%
2º saque: +3%
3º saque: +6%
4º+ saque: +10%
```

### Bônus de Lealdade

```
< 30 dias: 0% (Normal)
30-90 dias: -2% (Fiel)
90-180 dias: -4% (Leal)
180+ dias: -6% (Veterano)
```

### Fórmula Final

```typescript
taxaFinal = taxaBase + taxaProgressiva - descontoLoyalty + gasFee

// Exemplo:
// Bronze, 2º saque, 60 dias sem sacar
taxaFinal = 12% + 3% - 2% = 13%
```

---

## 🗄️ Database Schema

### Campos Novos em `users`

```prisma
model User {
  // Campos existentes...
  id             String    @id @default(cuid())
  email          String    @unique
  status         UserStatus @default(INACTIVE)
  role           UserRole  @default(user)

  // ===== MLM v1.0 =====

  // Rank
  currentRank    MLMRank   @default(RECRUTA)
  rankStatus     RankStatus @default(ACTIVE)
  rankConqueredAt DateTime?

  // Downrank
  warningCount   Int       @default(0) // 0, 1, 2, 3
  originalRank   MLMRank?
  gracePeriodEndsAt DateTime?

  // Network stats (cache)
  totalDirects   Int       @default(0)
  lifetimeVolume Decimal   @default(0) @db.Decimal(20, 2)

  // Saldo bloqueado
  blockedBalance Decimal   @default(0) @db.Decimal(20, 2)

  // Saque tracking
  lastWithdrawalAt DateTime?
  withdrawalCount30d Int    @default(0)
  loyaltyTier    LoyaltyTier @default(NORMAL)

  // Relacionamentos
  referrer       User?     @relation("MLMNetwork", fields: [referrerId], references: [id])
  referrerId     String?
  referrals      User[]    @relation("MLMNetwork")

  commissions    Commission[]
  withdrawals    Withdrawal[]

  @@index([referrerId])
  @@index([currentRank])
  @@index([rankStatus])
}

enum MLMRank {
  RECRUTA
  BRONZE
  PRATA
  OURO
}

enum RankStatus {
  ACTIVE
  WARNING
  TEMPORARY_DOWNRANK
  DOWNRANKED
}

enum LoyaltyTier {
  NORMAL
  FIEL
  LEAL
  VETERANO
}
```

### Nova Tabela: `commissions`

```prisma
model Commission {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])

  // Origem
  fromUserId    String

  // Valores
  baseAmount    Decimal  @db.Decimal(20, 2)
  level         Int      // 1, 2, 3
  percentage    Decimal  @db.Decimal(5, 2)
  finalAmount   Decimal  @db.Decimal(20, 2)

  // Data
  referenceDate DateTime
  paidAt        DateTime?
  status        CommissionStatus @default(PENDING)

  createdAt     DateTime @default(now())

  @@index([userId, referenceDate])
  @@index([status])
}

enum CommissionStatus {
  PENDING
  PAID
  CANCELLED
}
```

### Nova Tabela: `withdrawals`

```prisma
model Withdrawal {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])

  // Valores
  amount            Decimal  @db.Decimal(20, 2)
  fee               Decimal  @db.Decimal(20, 2)
  netAmount         Decimal  @db.Decimal(20, 2)

  // Taxas aplicadas
  baseFee           Decimal  @db.Decimal(5, 2)
  progressiveFee    Decimal  @default(0) @db.Decimal(5, 2)
  loyaltyDiscount   Decimal  @default(0) @db.Decimal(5, 2)
  gasFee            Decimal  @default(0) @db.Decimal(10, 2)

  // Detalhes
  destinationAddress String
  tokenSymbol       String
  status            WithdrawalStatus @default(PENDING_APPROVAL)

  // Tracking
  rank              MLMRank
  loyaltyTier       LoyaltyTier
  withdrawalNumber  Int

  // Aprovação Admin
  approvedBy        String?
  approvedAt        DateTime?
  rejectedBy        String?
  rejectedAt        DateTime?
  rejectionReason   String?

  // Blockchain
  txHash            String?
  processedAt       DateTime?

  // Timestamps
  requestedAt       DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([userId, status])
  @@index([status, requestedAt])
}

enum WithdrawalStatus {
  PENDING_APPROVAL
  APPROVED
  PROCESSING
  COMPLETED
  REJECTED
  CANCELLED
  FAILED
}
```

### Nova Tabela: `monthly_stats`

```prisma
model MonthlyStats {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])

  // Período
  month           Int      // 1-12
  year            Int      // 2025, 2026...

  // Métricas
  activeDirects   Int      @default(0)
  totalVolume     Decimal  @default(0) @db.Decimal(20, 2)
  metRequirements Boolean  @default(false)

  // Snapshot
  rankAtStart     MLMRank

  createdAt       DateTime @default(now())

  @@unique([userId, year, month])
  @@index([userId])
}
```

---

## 🔌 API Endpoints (v1.0)

### 1. Profile & Network

```typescript
// GET /api/mlm/profile
interface MLMProfileResponse {
  user: {
    id: string;
    name: string;
    currentRank: MLMRank;
    rankStatus: RankStatus;
    blockedBalance: number;
  };

  requirements: {
    current: {
      minActiveDirects: number;
      minMonthlyVolume: number;
      minBlockedBalance: number;
    };
    actual: {
      activeDirects: number;
      monthlyVolume: number;
      blockedBalance: number;
    };
    met: boolean;
  };

  warning?: {
    status: RankStatus;
    warningCount: number;
    gracePeriodEndsAt?: string;
    message?: string;
  };
}

// GET /api/mlm/network
interface MLMNetworkResponse {
  directs: {
    id: string;
    name: string;
    rank: MLMRank;
    isActive: boolean;
    balance: number;
  }[];

  stats: {
    totalDirects: number;
    activeDirects: number;
    lifetimeVolume: number;
  };

  levels: {
    N1: { count: number; totalBalance: number };
    N2: { count: number; totalBalance: number };
    N3: { count: number; totalBalance: number };
  };
}

// GET /api/mlm/commissions
interface MLMCommissionsResponse {
  commissions: {
    id: string;
    fromUser: { name: string; rank: MLMRank };
    level: number;
    baseAmount: number;
    percentage: number;
    finalAmount: number;
    referenceDate: string;
    status: CommissionStatus;
  }[];

  summary: {
    today: number;
    thisMonth: number;
    total: number;
  };
}
```

### 2. Withdrawals

```typescript
// POST /api/mlm/withdrawals
interface CreateWithdrawalRequest {
  amount: number;
  destinationAddress: string;
  tokenSymbol: string;
}

interface CreateWithdrawalResponse {
  withdrawal: {
    id: string;
    amount: number;
    fee: number;
    netAmount: number;
    status: WithdrawalStatus;
  };

  fees: {
    baseFee: number;
    progressiveFee: number;
    loyaltyDiscount: number;
    gasFee: number;
    total: number;
  };
}

// GET /api/mlm/withdrawals
interface ListWithdrawalsResponse {
  withdrawals: {
    id: string;
    amount: number;
    netAmount: number;
    status: WithdrawalStatus;
    requestedAt: string;
    processedAt?: string;
  }[];
}
```

### 3. Admin Endpoints

```typescript
// GET /admin/mlm/stats
interface MLMGlobalStatsResponse {
  ranks: {
    rank: MLMRank;
    count: number;
    totalCommissions: number;
  }[];

  totalUsers: number;
  totalVolume: number;
  totalCommissionsPaid: number;
}

// GET /admin/mlm/users-at-risk
interface UsersAtRiskResponse {
  users: {
    id: string;
    name: string;
    rank: MLMRank;
    warningCount: number;
    gracePeriodEndsAt?: string;
    missingRequirements: string[];
  }[];
}

// POST /admin/withdrawals/:id/approve
interface ApproveWithdrawalRequest {
  adminId: string;
}
```

---

## ⚙️ Cron Jobs

### 1. Cálculo de Comissões Diárias

```typescript
// CRON: 00:05 UTC diariamente
// Job: calculate-daily-commissions

async function calculateDailyCommissions() {
  const users = await prisma.user.findMany({
    where: {
      currentRank: { not: "RECRUTA" },
      status: "ACTIVE",
    },
  });

  for (const user of users) {
    const network = await getNetworkLevels(user.id); // N1, N2, N3
    const config = RANK_CONFIG[user.currentRank];

    for (const [level, users] of Object.entries(network)) {
      const percentage = config.commissions[level];

      for (const networkUser of users) {
        const baseAmount = networkUser.totalBalance;
        const commission = baseAmount * (percentage / 100);

        // Salvar comissão
        await prisma.commission.create({
          data: {
            userId: user.id,
            fromUserId: networkUser.id,
            level: parseInt(level.replace("N", "")),
            baseAmount: commission,
            percentage,
            finalAmount: commission,
            referenceDate: yesterday,
            status: "PENDING",
          },
        });

        // Atualizar balance
        await prisma.user.update({
          where: { id: user.id },
          data: { availableBalance: { increment: commission } },
        });
      }
    }
  }
}

cron.schedule("5 0 * * *", calculateDailyCommissions);
```

### 2. Verificação Mensal de Requisitos

```typescript
// CRON: 00:00 UTC dia 1
// Job: check-monthly-maintenance

async function checkMonthlyMaintenance() {
  const lastMonth = getLastMonthRange();

  const users = await prisma.user.findMany({
    where: {
      currentRank: { not: "RECRUTA" },
      status: "ACTIVE",
    },
  });

  for (const user of users) {
    const stats = await calculateMonthlyStats(user.id, lastMonth);

    // Salvar stats
    await prisma.monthlyStats.create({
      data: {
        userId: user.id,
        month: lastMonth.month,
        year: lastMonth.year,
        activeDirects: stats.activeDirects,
        totalVolume: stats.totalVolume,
        metRequirements: stats.metRequirements,
        rankAtStart: user.currentRank,
      },
    });

    if (!stats.metRequirements) {
      await handleMaintenanceFailure(user);
    } else {
      // Requisitos cumpridos
      await prisma.user.update({
        where: { id: user.id },
        data: {
          warningCount: 0,
          rankStatus: "ACTIVE",
          gracePeriodEndsAt: null,
        },
      });
    }
  }
}

async function handleMaintenanceFailure(user: User) {
  const newWarningCount = user.warningCount + 1;

  if (newWarningCount === 1) {
    // Mês 1: Aviso
    await prisma.user.update({
      where: { id: user.id },
      data: {
        warningCount: 1,
        rankStatus: "WARNING",
        gracePeriodEndsAt: addDays(new Date(), 7),
      },
    });

    await sendEmail(user.email, "warning-month-1");

  } else if (newWarningCount === 2) {
    // Mês 2: Downrank temporário -1
    const newRank = downgradeRank(user.currentRank, -1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        warningCount: 2,
        rankStatus: "TEMPORARY_DOWNRANK",
        currentRank: newRank,
        originalRank: user.currentRank,
      },
    });

    await sendEmail(user.email, "downrank-temporary");

  } else if (newWarningCount === 3) {
    // Mês 3: Downrank permanente -2
    const originalRank = user.originalRank || user.currentRank;
    const newRank = downgradeRank(originalRank, -2);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        warningCount: 0,
        rankStatus: "DOWNRANKED",
        currentRank: newRank,
        originalRank: null,
        rankConqueredAt: new Date(),
      },
    });

    await sendEmail(user.email, "downrank-permanent");
  }
}

cron.schedule("0 0 1 * *", checkMonthlyMaintenance);
```

### 3. Verificação de Grace Period

```typescript
// CRON: 12:00 UTC diariamente
// Job: check-grace-period-recovery

async function checkGracePeriodRecovery() {
  const users = await prisma.user.findMany({
    where: {
      rankStatus: "WARNING",
      gracePeriodEndsAt: { gte: new Date() },
    },
  });

  for (const user of users) {
    const stats = await calculateCurrentMonthStats(user.id);

    if (stats.metRequirements) {
      // Recuperou!
      await prisma.user.update({
        where: { id: user.id },
        data: {
          warningCount: 0,
          rankStatus: "ACTIVE",
          gracePeriodEndsAt: null,
        },
      });

      await sendEmail(user.email, "grace-period-success");
    }
  }
}

cron.schedule("0 12 * * *", checkGracePeriodRecovery);
```

---

## 💸 Modelo de Sustentabilidade

### Estratégia DeFi Yield

```
Fundos Depositados
↓
Investidos em DeFi (Aave, Compound)
↓
Rendimento: 15-20% APY
↓
Distribuição:
├─ 70% → Comissões MLM
├─ 20% → Reserva de segurança
└─ 10% → Lucro plataforma
```

### Projeção

```
┌──────────────┬─────────────┬────────────┬──────────────┬────────────┐
│ TVL          │ DeFi APY    │ Rendimento │ Comissões    │ Margem     │
├──────────────┼─────────────┼────────────┼──────────────┼────────────┤
│ $1M          │ 15%         │ $150K/ano  │ $105K/ano    │ $45K/ano   │
│ $10M         │ 15%         │ $1.5M/ano  │ $1.05M/ano   │ $450K/ano  │
│ $100M        │ 15%         │ $15M/ano   │ $10.5M/ano   │ $4.5M/ano  │
└──────────────┴─────────────┴────────────┴──────────────┴────────────┘
```

---

## 🚀 Roadmap de Implementação

### Fase 1: Database & Core (2 semanas)
- [ ] Schema Prisma (users, commissions, withdrawals, monthly_stats)
- [ ] Migração
- [ ] Funções de cálculo de requisitos
- [ ] Testes unitários

### Fase 2: API & Business Logic (2 semanas)
- [ ] Endpoints MLM (/api/mlm/*)
- [ ] Use cases (rank progression, downrank)
- [ ] Sistema de comissões
- [ ] Cron jobs

### Fase 3: Frontend (3 semanas)
- [ ] Dashboard MLM
- [ ] Visualização de genealogia
- [ ] Gráficos de comissões
- [ ] Sistema de notificações

### Fase 4: Admin & Testing (1 semana)
- [ ] Dashboard admin
- [ ] Aprovação de saques
- [ ] Tests integration
- [ ] Tests E2E

---

## 📋 Checklist de Lançamento

### Técnico
- [ ] Todos testes passando
- [ ] Cron jobs configurados
- [ ] Backup automático
- [ ] Monitoring (Sentry)
- [ ] Rate limiting

### Compliance
- [ ] Termos de Uso MLM
- [ ] Disclaimers
- [ ] Política de comissões

### Marketing
- [ ] Landing page
- [ ] Vídeos explicativos
- [ ] FAQ

---

## 🎯 Próximas Versões

### v2.0 - Expansão (Depois de v1.0 estável)
- +4 ranks (Platina até Imperial)
- Gamificação (streaks, badges, leaderboards)
- Matching bonus
- Pool global
- N4 e N5+ comissões

### v3.0 - Avançado
- Compressão dinâmica
- Sistema de recovery avançado
- Analytics completo

---

**Versão:** 1.0 (MVP Inicial)
**Data:** 2025-10-23
**Status:** Pronto para Implementação
**Versão Completa:** Ver `PRD-MLM-v3.0-FULL.md`
