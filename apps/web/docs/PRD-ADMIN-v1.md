# PRD - Admin Login + Dashboard v1.0

**Produto:** Sistema de Autenticação e Dashboard Administrativo
**Versão:** 1.0
**Data:** 2025-10-26
**Status:** Draft

---

## 1. Visão Geral

### 1.1 Objetivo

Implementar sistema de autenticação seguro para administradores com dashboard para gerenciamento da plataforma MLM de criptomoedas. O sistema prioriza segurança através de rotas ocultas (UUID) e integração com o backend já existente (Better Auth).

### 1.2 Escopo

**Incluído nesta versão (MVP v1.0 - ULTRA ENXUTO):**
- Tela de login administrativo em rota UUID oculta
- Sistema de autenticação integrado com Better Auth (backend)
- **4 Funcionalidades APENAS:**
  1. **Visualizar Carteira Global** - Saldos de tokens na Global Wallet
  2. **Batch Collect** - Transferir fundos de usuários para Global Wallet
  3. **Verificar MATIC** - Monitorar saldo de MATIC para gas fees + recarga
  4. **Saques** - Aprovar ou recusar saques pendentes

**Fora do escopo (versões futuras):**
- ❌ Dashboard Overview (métricas gerais, gráficos)
- ❌ Gerenciamento de Usuários (listar, bloquear, desbloquear)
- ❌ Histórico completo de Transações
- ❌ Configurações do sistema
- ❌ Landing page pública
- ❌ Sistema de recuperação de senha
- ❌ Autenticação multi-fator (2FA)

### 1.3 Personas

**Administrador do Sistema:**
- Acessa via rota UUID secreta compartilhada manualmente
- Gerencia saques, usuários e transações da plataforma
- Necessita de visibilidade completa do sistema
- Trabalha majoritariamente em desktop

---

## 2. Arquitetura de Autenticação

### 2.1 Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Admin acessa /admin/[UUID]                               │
│    - UUID é compartilhado manualmente (via email/chat)      │
│    - Rota não é descobrível por crawlers ou força bruta     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Formulário de Login                                       │
│    - Email + Password                                        │
│    - Validação client-side (Zod)                            │
│    - POST /api/auth/sign-in (Better Auth)                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend valida credenciais                               │
│    - Better Auth verifica email/password                     │
│    - Verifica role === "admin"                              │
│    - Verifica status !== "BLOCKED"                          │
│    - Retorna session cookie (HTTP-only)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Redirect para Dashboard                                  │
│    - /admin/dashboard (rota protegida)                      │
│    - Middleware verifica session + role                     │
│    - Carrega dados iniciais (TanStack Query)                │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Integração com Backend

**Endpoints existentes (Better Auth):**
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Obter sessão atual

**Validações necessárias:**
1. Email válido + senha correta
2. Usuário com `role = "admin"`
3. Usuário com `status != "BLOCKED"`

**Session Management:**
- Cookie HTTP-only (configurado pelo Better Auth)
- Renovação automática de sessão
- Logout manual ou expiração após inatividade

### 2.3 Proteção de Rotas

**Middleware de Autenticação (Next.js):**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger todas as rotas /admin/* exceto /admin/[uuid]
  if (pathname.startsWith('/admin/dashboard')) {
    const session = await getSession(request) // TBD: Better Auth client

    if (!session?.user) {
      return NextResponse.redirect(new URL('/admin/access-denied', request.url))
    }

    if (session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/access-denied', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

---

## 3. Especificação da Tela de Login

### 3.1 Rota

**URL Pattern:** `/admin/[uuid]`

**Exemplo:** `/admin/a7f3c2e1-9b4d-4e8f-a1c3-7d6e9f2b8a4c`

**Comportamento:**
- UUID é gerado manualmente e compartilhado com admins via canal seguro
- Não existe link público para esta rota
- UUID não precisa estar no banco de dados (é apenas ofuscação, não autenticação)
- Qualquer UUID válido renderiza a tela de login (validação real acontece no backend)

**Implementação:**
```typescript
// app/admin/[uuid]/page.tsx
export default function AdminLoginPage({ params }: { params: { uuid: string } }) {
  // Validar formato UUID (opcional, para UX)
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.uuid)

  if (!isValidUUID) {
    return <NotFound />
  }

  return <AdminLoginForm />
}
```

### 3.2 UI Components

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     [Logo/Brand]                            │
│                                                             │
│              Admin Access - Secure Login                    │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │ Email                                             │     │
│  │ ┌─────────────────────────────────────────────┐   │     │
│  │ │ admin@example.com                           │   │     │
│  │ └─────────────────────────────────────────────┘   │     │
│  │                                                   │     │
│  │ Password                                          │     │
│  │ ┌─────────────────────────────────────────────┐   │     │
│  │ │ ••••••••                                    │   │     │
│  │ └─────────────────────────────────────────────┘   │     │
│  │                                                   │     │
│  │         [Sign In →]                               │     │
│  │                                                   │     │
│  │ {error message if any}                            │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Components (shadcn/ui):**
- `Card` - Container do formulário
- `Input` - Campos de email e password
- `Button` - Botão de submit
- `Label` - Labels dos campos
- `Form` - Wrapper react-hook-form
- `Alert` - Mensagens de erro

### 3.3 Validação (Zod Schema)

```typescript
import { z } from 'zod'

export const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

export type AdminLoginInput = z.infer<typeof adminLoginSchema>
```

### 3.4 Estados da UI

**Loading:**
- Botão com spinner + disabled
- Texto: "Signing in..."
- Campos desabilitados

**Success:**
- Redirect imediato para `/admin/dashboard`
- Não mostrar mensagem de sucesso (UX mais rápida)

**Error:**
```typescript
// Tipos de erro possíveis
type LoginError =
  | 'INVALID_CREDENTIALS'    // Email/senha incorretos
  | 'NOT_ADMIN'              // Usuário não é admin
  | 'ACCOUNT_BLOCKED'        // Conta bloqueada
  | 'NETWORK_ERROR'          // Falha de conexão
  | 'UNKNOWN_ERROR'          // Erro genérico

// Mensagens em português
const errorMessages: Record<LoginError, string> = {
  INVALID_CREDENTIALS: 'Email ou senha incorretos',
  NOT_ADMIN: 'Acesso negado. Apenas administradores podem acessar.',
  ACCOUNT_BLOCKED: 'Sua conta foi bloqueada. Entre em contato com o suporte.',
  NETWORK_ERROR: 'Erro de conexão. Tente novamente.',
  UNKNOWN_ERROR: 'Erro desconhecido. Tente novamente.',
}
```

### 3.5 Segurança

**Client-side:**
- Não expor role do usuário no código client
- Não armazenar UUID em localStorage
- Limpar formulário após erro

**Network:**
- HTTPS obrigatório em produção
- Cookie HTTP-only (configurado pelo backend)
- CORS configurado para domínio específico

---

## 4. Especificação do Dashboard Administrativo

### 4.1 Rota

**URL:** `/admin/dashboard`

**Proteção:**
- Middleware verifica session + role = "admin"
- Redirect para `/admin/access-denied` se não autorizado

### 4.2 Layout Base

**Estrutura:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar]     │  [Header: Notifications, User Menu]         │
├───────────────┼─────────────────────────────────────────────┤
│               │                                             │
│  Dashboard    │  [Content Area]                             │
│  Withdrawals  │                                             │
│  Users        │                                             │
│  Transactions │                                             │
│  Settings     │                                             │
│               │                                             │
│  [Logout]     │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

**Components:**
- `Sidebar` - Navegação principal
- `Header` - Informações da sessão, notificações
- `Main Content` - Área dinâmica (rotas aninhadas)

### 4.3 Navegação (MVP v1.0 - SIMPLIFICADO)

**Menu Items:**
1. **Carteira Global** - Visualizar saldos da Global Wallet
2. **Batch Collect** - Transferir fundos para Global Wallet
3. **MATIC** - Monitorar e recarregar MATIC (gas fees)
4. **Saques** - Aprovar/recusar saques pendentes

**Futuro (v2.0+):**
- Dashboard Overview (métricas gerais)
- Usuários (gerenciamento)
- Transações (histórico completo)
- Configurações

**Implementação:**
```typescript
// app/admin/dashboard/layout.tsx
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

export default function AdminDashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### 4.4 Features MVP v1.0 (APENAS 4 FUNCIONALIDADES)

#### 4.4.1 Visualizar Carteira Global

**Objetivo:** Monitorar saldos de tokens na Global Wallet

**UI:**
```
┌─────────────────────────────────────────────────────────────┐
│ Carteira Global                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Endereço: 0x1234...5678                      [Copiar]     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Token      │ Saldo         │ USD Equiv.   │ Última   │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ USDC       │ 10,250.00     │ $10,250.00   │ 1min ago │  │
│  │ USDT       │ 5,430.00      │ $5,430.00    │ 1min ago │  │
│  │ MATIC      │ 150.50        │ $120.40      │ 1min ago │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Total em USD: $15,800.40                                  │
│                                                             │
│  [Atualizar]                                               │
└─────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Listar todos os tokens na Global Wallet
- Mostrar saldo de cada token
- Converter para USD (usando CoinGecko API)
- Botão para atualizar manualmente

**API Endpoints:**
```typescript
GET /api/admin/global-wallet/balance
Response: {
  address: string
  balances: Array<{
    tokenSymbol: string
    balance: string       // Decimal
    usdValue: string      // Decimal
    lastUpdated: string   // ISO datetime
  }>
  totalUsd: string        // Decimal
}
```

#### 4.4.2 Batch Collect

**Objetivo:** Transferir fundos de carteiras de usuários para Global Wallet

**UI:**
```
┌─────────────────────────────────────────────────────────────┐
│ Batch Collect                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Status: Pronto para coletar                               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Token      │ Carteiras │ Total a Coletar │ Gas Est.  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ USDC       │ 15        │ 1,250.00        │ 0.05 MATIC│  │
│  │ USDT       │ 8         │ 430.00          │ 0.03 MATIC│  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Gas Total Estimado: 0.08 MATIC (~$0.06)                   │
│  MATIC Disponível: 150.50 ✅                               │
│                                                             │
│  [Executar Batch Collect]                                  │
│                                                             │
│  ⚠️ Isso irá transferir todos os fundos de usuários para   │
│     a Global Wallet. Ação irreversível.                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Histórico de Batch Collects                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Data/Hora        │ Token │ Coletado │ Status │ TxHash│  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ 26/10 14:30      │ USDC  │ 500.00   │ ✅     │ 0x9b..│  │
│  │ 25/10 09:15      │ USDT  │ 200.00   │ ✅     │ 0x7a..│  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Ver preview do que será coletado (antes de executar)
- Estimativa de gas fees
- Validar se há MATIC suficiente na Global Wallet
- Executar batch collect
- Ver histórico de batch collects

**API Endpoints:**
```typescript
GET /api/admin/batch-collect/preview
Response: {
  tokens: Array<{
    tokenSymbol: string
    walletsCount: number
    totalAmount: string    // Decimal
    gasEstimate: string    // MATIC
  }>
  totalGasEstimate: string // MATIC
  maticBalance: string
  canExecute: boolean      // false se MATIC insuficiente
}

POST /api/admin/batch-collect/execute
Body: {
  tokenSymbol?: string  // Se omitir, coleta todos os tokens
}
Response: {
  jobId: string           // ID do job assíncrono
  status: 'PENDING'
}

GET /api/admin/batch-collect/status/:jobId
Response: {
  jobId: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  progress: {
    total: number
    completed: number
    failed: number
  }
  results?: Array<{
    userId: string
    tokenSymbol: string
    amount: string
    txHash?: string
    error?: string
  }>
}

GET /api/admin/batch-collect/history?limit=20
Response: {
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

#### 4.4.3 Monitoramento de MATIC

**Objetivo:** Garantir que há MATIC suficiente para gas fees

**UI:**
```
┌─────────────────────────────────────────────────────────────┐
│ MATIC (Gas Fees)                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Saldo Atual: 150.50 MATIC (~$120.40)                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Estimativas de Consumo:                              │  │
│  │                                                       │  │
│  │ • Saques Pendentes (5): ~0.25 MATIC                  │  │
│  │ • Batch Collect (próximo): ~0.08 MATIC               │  │
│  │ • Reserva Recomendada: 50 MATIC                      │  │
│  │                                                       │  │
│  │ Total Necessário: ~50.33 MATIC                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Status: ✅ MATIC Suficiente                               │
│                                                             │
│  ⚠️ Alerta se saldo < 50 MATIC                             │
│  🔴 Crítico se saldo < 10 MATIC                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Recarga de MATIC:                                    │  │
│  │                                                       │  │
│  │ Quantidade: [____] MATIC                             │  │
│  │                                                       │  │
│  │ Endereço para envio:                                 │  │
│  │ 0x1234...5678                          [Copiar]      │  │
│  │                                                       │  │
│  │ ⚠️ Envie MATIC (Polygon Network) para este endereço  │  │
│  │    A recarga será detectada automaticamente          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Histórico de Recargas:                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Data/Hora        │ Quantidade │ TxHash       │ Status│  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ 20/10 10:00      │ 100 MATIC  │ 0x3c...      │ ✅    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Mostrar saldo atual de MATIC
- Estimar consumo para operações pendentes
- Alertas visuais (verde/amarelo/vermelho)
- Mostrar endereço da Global Wallet para recarga
- Histórico de recargas (depósitos de MATIC na Global Wallet)

**API Endpoints:**
```typescript
GET /api/admin/matic/status
Response: {
  balance: string              // Decimal (MATIC)
  usdValue: string             // Decimal
  estimates: {
    pendingWithdrawals: string // MATIC
    nextBatchCollect: string   // MATIC
    recommended: string        // MATIC (reserva)
  }
  status: 'OK' | 'WARNING' | 'CRITICAL'
  globalWalletAddress: string
}

GET /api/admin/matic/recharge-history?limit=20
Response: {
  history: Array<{
    txHash: string
    amount: string    // MATIC
    createdAt: string
    status: 'CONFIRMED' | 'PENDING'
  }>
}
```

#### 4.4.4 Gerenciamento de Saques

**Funcionalidades:**
- Listar saques pendentes (tabela)
- Aprovar saque (modal de confirmação)
- Rejeitar saque (modal com motivo)
- Filtros: status, usuário, token, data

**Tabela de Saques:**
| ID | Usuário | Token | Valor | Endereço | Data | Status | Ações |
|----|---------|-------|-------|----------|------|--------|-------|
| #123 | user@ex.com | USDC | 500.00 | 0x7a... | 26/10 10:30 | PENDING | [Approve] [Reject] |

**API Endpoints:**
```typescript
GET /api/admin/withdrawals?status=PENDING&page=1&limit=20
Response: {
  withdrawals: Withdrawal[]
  pagination: { total: number, page: number, limit: number }
}

POST /api/admin/withdrawals/:id/approve
Body: { adminNote?: string }
Response: { success: true }

POST /api/admin/withdrawals/:id/reject
Body: { reason: string }
Response: { success: true }
```


### 4.5 Data Fetching Strategy

**TanStack Query:**
```typescript
// hooks/use-admin-metrics.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: () => apiClient.get('/admin/metrics'),
    refetchInterval: 30000, // Refresh a cada 30s
    staleTime: 10000,
  })
}

// hooks/use-withdrawals.ts
export function useWithdrawals(filters: WithdrawalFilters) {
  return useQuery({
    queryKey: ['admin', 'withdrawals', filters],
    queryFn: () => apiClient.get('/admin/withdrawals', { params: filters }),
  })
}

// hooks/use-approve-withdrawal.ts
export function useApproveWithdrawal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/withdrawals/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] })
    },
  })
}
```

### 4.6 Theme (Dark Mode)

**Configuração Global:**
```typescript
// app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}  // Apenas dark mode
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**CSS Variables (globals.css):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: oklch(0.145 0 0);          /* Dark background */
    --foreground: oklch(0.985 0 0);          /* Light text */
    --card: oklch(0.18 0 0);                 /* Card background */
    --card-foreground: oklch(0.985 0 0);     /* Card text */
    --primary: oklch(0.7 0.2 240);           /* Primary blue */
    --primary-foreground: oklch(0.985 0 0);  /* Primary text */
    --border: oklch(0.25 0 0);               /* Borders */
    --input: oklch(0.25 0 0);                /* Input borders */
    --ring: oklch(0.7 0.2 240);              /* Focus ring */
  }
}
```

---

## 5. Arquitetura Técnica

### 5.1 Estrutura de Pastas

```
apps/web/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── [uuid]/
│   │   │   │   └── page.tsx              # Login page
│   │   │   ├── dashboard/
│   │   │   │   ├── layout.tsx            # Dashboard layout
│   │   │   │   ├── page.tsx              # Overview
│   │   │   │   ├── withdrawals/
│   │   │   │   │   └── page.tsx          # Withdrawals management
│   │   │   │   ├── users/
│   │   │   │   │   ├── page.tsx          # Users list
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx      # User details
│   │   │   │   └── transactions/
│   │   │   │       └── page.tsx          # Transactions list
│   │   │   └── access-denied/
│   │   │       └── page.tsx              # 403 page
│   │   ├── layout.tsx                    # Root layout
│   │   └── globals.css                   # Global styles
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── form.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── admin/
│   │   │   ├── sidebar.tsx               # Admin sidebar
│   │   │   ├── header.tsx                # Admin header
│   │   │   ├── login-form.tsx            # Login form
│   │   │   ├── metrics-card.tsx          # Metrics display
│   │   │   ├── withdrawals-table.tsx     # Withdrawals table
│   │   │   └── users-table.tsx           # Users table
│   │   └── theme-provider.tsx            # Theme provider
│   ├── hooks/
│   │   ├── use-admin-metrics.ts          # TanStack Query hooks
│   │   ├── use-withdrawals.ts
│   │   ├── use-users.ts
│   │   └── use-auth.ts                   # Auth session hook
│   ├── lib/
│   │   ├── api-client.ts                 # Axios instance
│   │   ├── utils.ts                      # cn() and utilities
│   │   └── auth.ts                       # Better Auth client
│   └── middleware.ts                     # Route protection
├── docs/
│   └── PRD-ADMIN-v1.md                   # This document
├── components.json                       # shadcn/ui config
├── tailwind.config.ts                    # Tailwind config
├── tsconfig.json                         # TypeScript config
└── package.json                          # Dependencies
```

### 5.2 API Client Setup

```typescript
// lib/api-client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
  withCredentials: true, // Envia cookies (session)
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para erros globais
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect para login se não autenticado
      window.location.href = '/admin/access-denied'
    }
    return Promise.reject(error)
  }
)
```

### 5.3 Better Auth Client

```typescript
// lib/auth.ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
})

// Hook para acessar sessão
export function useAuth() {
  return authClient.useSession()
}
```

### 5.4 Type Safety (Shared Types)

**Criar package shared-types (monorepo):**
```typescript
// packages/shared-types/src/index.ts
export interface User {
  id: string
  email: string
  role: 'user' | 'admin'
  status: 'INACTIVE' | 'ACTIVE' | 'BLOCKED'
  createdAt: Date
  updatedAt: Date
}

export interface Withdrawal {
  id: string
  userId: string
  tokenSymbol: string
  amount: string
  toAddress: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SENT'
  txHash?: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  userId: string
  type: 'DEPOSIT' | 'WITHDRAWAL'
  tokenSymbol: string
  amount: string
  status: 'PENDING' | 'CONFIRMED' | 'SENT_TO_GLOBAL'
  txHash: string
  createdAt: Date
}

export interface AdminMetrics {
  users: {
    total: number
    active: number
    inactive: number
    blocked: number
  }
  deposits: {
    last24h: string
    last7d: string
    last30d: string
    allTime: string
  }
  withdrawals: {
    pending: { count: number; total: string }
    approved: { count: number; total: string }
    rejected: { count: number; total: string }
  }
}
```

**Uso no frontend:**
```typescript
import type { User, Withdrawal, AdminMetrics } from '@mvppir/shared-types'

export function useAdminMetrics() {
  return useQuery<AdminMetrics>({
    queryKey: ['admin', 'metrics'],
    queryFn: () => apiClient.get('/admin/metrics'),
  })
}
```

---

## 6. Fases de Implementação

### Fase 1: Setup Base (1-2 dias)
- [x] Dependências já instaladas (Next.js, Tailwind, shadcn, TanStack Query, Zod)
- [ ] Configurar ThemeProvider com dark mode
- [ ] Instalar componentes shadcn/ui necessários:
  - `npx shadcn@latest add button card input label form alert`
  - `npx shadcn@latest add table dropdown-menu avatar`
- [ ] Configurar API client (axios)
- [ ] Configurar Better Auth client
- [ ] Criar estrutura de pastas

### Fase 2: Autenticação (2-3 dias)
- [ ] Implementar página de login (`/admin/[uuid]`)
- [ ] Criar AdminLoginForm component
- [ ] Integrar com Better Auth sign-in
- [ ] Implementar validação de erros
- [ ] Criar middleware de proteção de rotas
- [ ] Implementar página 403 (access-denied)
- [ ] Testes manuais de fluxo de login

### Fase 3: Layout do Dashboard (1-2 dias)
- [ ] Criar layout base (Sidebar + Header + Content)
- [ ] Implementar navegação do sidebar
- [ ] Criar header com informações da sessão
- [ ] Implementar logout
- [ ] Criar página de overview (vazia inicialmente)
- [ ] Garantir responsividade (mobile-friendly)

### Fase 4: Features do Dashboard (3-5 dias)

**4.1 Carteira Global:**
- [ ] Criar página `/admin/dashboard/global-wallet`
- [ ] Implementar GlobalWalletBalance component
- [ ] Integrar com endpoint `/api/admin/global-wallet/balance`
- [ ] Mostrar saldos de tokens + conversão USD
- [ ] Botão de refresh manual

**4.2 Batch Collect:**
- [ ] Criar página `/admin/dashboard/batch-collect`
- [ ] Implementar BatchCollectPreview component
- [ ] Integrar com endpoint `/api/admin/batch-collect/preview`
- [ ] Criar modal de confirmação
- [ ] Implementar execução do batch collect
- [ ] Polling de status do job (loading state)
- [ ] Mostrar histórico de batch collects

**4.3 Monitoramento de MATIC:**
- [ ] Criar página `/admin/dashboard/matic`
- [ ] Implementar MaticStatus component
- [ ] Integrar com endpoint `/api/admin/matic/status`
- [ ] Alertas visuais (OK/WARNING/CRITICAL)
- [ ] Mostrar endereço para recarga
- [ ] Histórico de recargas

**4.4 Gerenciamento de Saques:**
- [ ] Criar página `/admin/dashboard/withdrawals`
- [ ] Implementar WithdrawalsTable component
- [ ] Integrar com endpoint `/api/admin/withdrawals`
- [ ] Criar modal de aprovação
- [ ] Criar modal de rejeição (com campo de motivo)
- [ ] Implementar filtros (status apenas)
- [ ] Implementar paginação

### Fase 5: Polimento e Testes (1-2 dias)
- [ ] Revisar UX/UI (consistência visual)
- [ ] Implementar loading states (skeleton loaders)
- [ ] Implementar error boundaries
- [ ] Testes manuais das 4 funcionalidades
- [ ] Garantir acessibilidade básica
- [ ] Documentação de uso para admins

**Total estimado: 8-13 dias (vs 11-17 dias original)**

---

## 7. Métricas de Sucesso

**Funcionalidade:**
- ✅ Admin consegue fazer login via rota UUID
- ✅ Apenas usuários com role=admin conseguem acessar dashboard
- ✅ Admin consegue aprovar/rejeitar saques
- ✅ Admin consegue visualizar usuários e transações
- ✅ Logout funciona corretamente

**Performance:**
- ⚡ Lighthouse score > 90 (Performance, Accessibility)
- ⚡ Tempo de carregamento inicial < 2s
- ⚡ Queries com TanStack Query retornam em < 500ms

**Segurança:**
- 🔒 Rota de login não é exposta publicamente
- 🔒 Middleware bloqueia acesso não autorizado
- 🔒 Session cookie é HTTP-only
- 🔒 HTTPS em produção

**UX:**
- 🎨 Tema dark consistente em todas as páginas
- 🎨 Feedback visual claro para ações (loading, success, error)
- 🎨 Responsivo em desktop e tablet (mobile opcional)

---

## 8. Requisitos Técnicos

### 8.1 Ambiente de Desenvolvimento

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Backend rodando em `http://localhost:3333`
- PostgreSQL + Redis (via Docker)

### 8.2 Variáveis de Ambiente

```bash
# .env.local (frontend)
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### 8.3 Dependências Críticas

**Já instaladas:**
- next@15.1.4
- react@19.0.0
- @tanstack/react-query@5.90.5
- zod@4.1.12
- react-hook-form@7.65.0
- tailwindcss@3.4.1
- lucide-react@0.548.0

**A instalar:**
- better-auth@latest (client)
- next-themes@latest (dark mode)
- axios@latest (API client)

---

## 9. Riscos e Mitigações

### Risco 1: UUID descoberto por força bruta
**Mitigação:**
- Usar UUID v4 (128 bits = 2^128 combinações)
- Rate limiting no backend (max 5 tentativas/minuto por IP)
- Monitoramento de tentativas de acesso suspeitas

### Risco 2: Session hijacking
**Mitigação:**
- Cookie HTTP-only (não acessível via JS)
- SameSite=Strict
- HTTPS em produção
- Renovação de session token periodicamente

### Risco 3: Performance com muitos dados
**Mitigação:**
- Paginação obrigatória em todas as tabelas
- Índices no banco de dados (userId, status, createdAt)
- Cache com TanStack Query (staleTime, refetchInterval)

### Risco 4: Erros de integração com Better Auth
**Mitigação:**
- Testes manuais extensivos do fluxo de login
- Logs detalhados de erros de autenticação
- Fallback para erro genérico (não expor detalhes técnicos)

---

## 10. Próximos Passos (v2.0)

- [ ] Recuperação de senha para admins
- [ ] Autenticação multi-fator (2FA)
- [ ] Exportação de relatórios (CSV, PDF)
- [ ] Dashboard de métricas avançadas (gráficos interativos)
- [ ] Logs de auditoria (quem aprovou/rejeitou saques)
- [ ] Notificações em tempo real (WebSockets)
- [ ] Pesquisa avançada (full-text search)
- [ ] Bulk actions (aprovar múltiplos saques de uma vez)

---

## 11. Aprovação

**Status:** 🟡 Draft - Aguardando aprovação do usuário

**Checklist de Aprovação:**
- [ ] Escopo está claro e completo
- [ ] Fluxo de autenticação está validado
- [ ] Features do dashboard atendem necessidades
- [ ] Arquitetura técnica está correta
- [ ] Fases de implementação são realistas
- [ ] Métricas de sucesso são mensuráveis

**Próximos passos após aprovação:**
1. Validar com usuário
2. Iniciar Fase 1 (Setup Base)
3. Atualizar status para "In Progress"

---

**Documento criado por:** Claude Code
**Última atualização:** 2025-10-26
