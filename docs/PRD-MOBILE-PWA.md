# PRD - App Mobile PWA (Progressive Web App)

**Projeto:** MVPPIR - Plataforma de Staking & MLM
**Tipo:** Product Requirements Document (PRD)
**Versão:** 1.0
**Data:** 2025-11-11
**Status:** Aprovado para desenvolvimento

---

## 📋 Índice

1. [Resumo Executivo](#1-resumo-executivo)
2. [Objetivos](#2-objetivos)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Arquitetura](#4-arquitetura)
5. [Funcionalidades & Telas](#5-funcionalidades--telas)
6. [Integração com API](#6-integração-com-api)
7. [Capacidades PWA](#7-capacidades-pwa)
8. [Estratégia de Migração](#8-estratégia-de-migração)
9. [Critérios de Sucesso](#9-critérios-de-sucesso)
10. [Deploy](#10-deploy)

---

## 1. Resumo Executivo

### 1.1 Contexto

O app mobile atual é construído com React Native (Expo), o que requer:
- Conta Apple Developer ($99/ano) para distribuição iOS
- Conta Google Play Developer ($25 único) para Android
- Processo de revisão nas lojas (1-7 dias)
- Distribuição centralizada em app stores
- **Risco crítico:** Exposição de identidade e falta de anonimato

### 1.2 Problema

O React Native compromete o anonimato porque:

1. **Rastreabilidade de Identidade:** Contas vinculadas a identidades reais (CPF, cartão de crédito)
2. **Assinaturas de Certificados:** Code signing revela informações do desenvolvedor
3. **Distribuição Centralizada:** App stores rastreiam downloads, dispositivos e usuários
4. **Processo de Revisão:** Apps podem ser rejeitados, removidos ou investigados

### 1.3 Solução: PWA (Progressive Web App)

**Migrar para PWA resolve todos os problemas:**

| Aspecto | React Native | PWA |
|---------|--------------|-----|
| **Distribuição** | App Store + Google Play | URL direta (https://app.stakly.com) |
| **Conta Developer** | Obrigatória ($99-124/ano) | **Não necessária** |
| **Exposição ID** | Sim (certificados, App Store) | **Não (hosting anônimo)** |
| **Instalação** | Download da loja (50-100MB) | Add to Home Screen (2-5MB) |
| **Atualizações** | Revisão (1-7 dias) | **Instantânea** |
| **Offline** | Nativo | Service Worker (equivalente) |
| **Push Notifications** | Expo Push (1M/mês grátis) | Web Push API (ilimitado) |
| **Câmera/QR** | APIs nativas | WebRTC + jsQR (equivalente) |
| **Performance** | 100% nativo | 90-95% nativo |
| **Rastreamento** | Rastreável por lojas | **Não rastreável** |

**Vantagens adicionais:**
- ✅ Deploy em qualquer domínio (inclusive .onion para Tor)
- ✅ Sem review process = deploy em minutos
- ✅ Cross-platform por padrão (iOS, Android, Desktop)
- ✅ SEO possível (se necessário no futuro)
- ✅ Mais leve (2-5MB vs 50MB+)

---

## 2. Objetivos

### 2.1 Objetivos de Negócio

1. **Preservar Anonimato Total:** Distribuição sem exposição de identidade do desenvolvedor
2. **Eliminar Custos Recorrentes:** Sem taxas de Apple/Google ($99-124/ano)
3. **Aumentar Agilidade:** Deploy instantâneo sem delays de revisão
4. **Reduzir Risco Legal:** Sem vínculos com lojas centralizadas

### 2.2 Objetivos Técnicos

1. **Paridade 100% de Features:** Replicar todas as funcionalidades do app mobile
2. **Performance ≥90% Nativa:** UX indistinguível de app nativo
3. **Offline-First:** Core features funcionam sem conexão
4. **Código Reutilizável:** Aproveitar 80%+ do código do mobile

### 2.3 Objetivos do Usuário

1. **Experiência Nativa:** Indistinguível de app de loja
2. **Instalação Simples:** 1 tap em "Adicionar à Tela Inicial"
3. **Performance:** < 2s load inicial, < 500ms navegação
4. **Confiável:** Funciona offline, sincroniza quando online

---

## 3. Stack Tecnológico

**VERSÕES: Últimas estáveis no momento da criação**

### 3.1 Core Framework

**Vite** (Build Tool - Latest Stable)
- ⚡ Build 20x mais rápido que Webpack
- 🔥 HMR instantâneo (< 50ms)
- 📦 Code splitting automático
- 🎯 Tree-shaking otimizado
- 🔧 Plugins PWA nativos

**React** (UI Framework - Latest Stable) - **MESMA VERSÃO DO MOBILE (19.1.0)**
- ⚡ React Compiler (otimizações automáticas)
- 🎭 Actions & Transitions
- 🪝 `use()` hook para promises
- 🔄 Suspense nativo para data fetching
- 📱 100% compatível com web mobile

**React Router** (Navegação - Latest Stable)
- 🗺️ Roteamento declarativo
- 🔒 Protected routes
- 📚 Nested routes
- ⚡ Code splitting por rota
- 🔄 Loaders para data fetching

### 3.2 UI & Estilização

**Tailwind CSS** (Latest Stable) - **MESMO DO MOBILE**
- 🎨 Design system idêntico ao mobile
- 📱 Mobile-first approach
- 🌙 Dark mode ready
- ⚡ JIT compiler

**shadcn/ui** (Componentes Base - Latest Stable)
- ♿ Acessibilidade nativa (Radix UI)
- 🎨 Customizável com Tailwind
- 📦 Copy-paste components
- 🔧 Headless components

**Phosphor Icons** (Latest Stable) - **MESMO DO MOBILE**
- 🎨 Mesmos ícones do app mobile
- ⚡ Tree-shakeable
- 📦 Apenas ícones usados no bundle

### 3.3 Gerenciamento de Estado

**Zustand** (Latest Stable) - **MESMA VERSÃO DO MOBILE (5.0.8)**
- 🪶 Leve (< 1KB)
- 🔄 Persist com localStorage
- 🎯 Sem boilerplate
- ⚡ Performance superior

**TanStack Query** (Latest Stable) - **MESMA VERSÃO DO MOBILE (5.90.x)**
- 🔄 Cache automático inteligente
- 📡 Refetch em background
- ♻️ Retry automático
- 💾 Persist com localStorage
- 🔔 Optimistic updates

**LocalStorage + IndexedDB**
- 💾 Persist de auth token (localStorage)
- 📦 Cache de queries (IndexedDB via TanStack Query)
- 🔒 Dados sensíveis criptografados

### 3.4 Data Fetching & API

**ky** (Latest Stable) - **MESMA VERSÃO DO MOBILE (1.13.x)**
- ⚡ Leve (< 5KB), baseado em Fetch API
- 🔄 Retry automático
- ⏱️ Timeout configurável
- 🎯 Interceptors para auth

**Better Auth** (Latest Stable) - **MESMA VERSÃO DO MOBILE (1.3.x)**
- 🔐 JWT authentication
- 🔄 Token refresh automático
- 🔒 Secure cookies
- 📱 Session management

**Zod** (Latest Stable) - **MESMA VERSÃO DO MOBILE (3.24.x)**
- ✅ Validação de schemas
- 🔧 Type inference automático
- 📝 Error messages customizados
- 🎯 Runtime type safety

**React Hook Form** (Latest Stable) - **MESMA VERSÃO DO MOBILE (7.65.x)**
- ⚡ Performance (uncontrolled components)
- ✅ Validação com Zod
- 🎯 Menor re-renders
- 📝 Form state management

### 3.5 PWA Features

**vite-plugin-pwa** (Latest Stable)
- 🔄 Auto-update
- 📦 Precache de assets
- 🌐 Offline fallback
- 🔔 Background sync

**Workbox** (Latest Stable)
- 🎯 Network First (API calls)
- 💾 Cache First (assets estáticos)
- 🔄 Stale While Revalidate (imagens)

**Web Push API** (Notificações)
- 🔔 Push notifications nativas
- 🔑 VAPID keys (self-hosted)
- 📱 iOS + Android support
- ♻️ Background sync

**Web APIs**
- 📷 MediaDevices API (câmera para QR)
- 🔐 Web Crypto API (criptografia)
- 🎤 Web Audio API (sons)
- 📤 Web Share API (compartilhamento nativo)
- 🔓 Web Authentication API (biometria - futuro)

### 3.6 Desenvolvimento

**TypeScript** (Latest Stable) - **MESMA VERSÃO DO MOBILE (5.9.x)**
- 🔧 Strict mode
- 🎯 Path aliases (@/ para src/)
- 📝 JSDoc support
- ⚡ Incremental builds

**Biome** (Latest Stable)
- ⚡ 100x mais rápido que ESLint
- 🎨 Substitui Prettier
- 🔧 Config mínima
- 🚀 Rust-based (performance)

**pnpm** (Package Manager)
- 💾 Economiza espaço (hard links)
- ⚡ Instalação mais rápida
- 🔒 Strict node_modules
- 📦 Workspace support (monorepo)

**Turbo** (Monorepo Build System)
- ⚡ Cache de builds
- 🔄 Parallel execution
- 📦 Task pipelines
- 🎯 Incremental builds

---

## 4. Arquitetura

### 4.1 Estrutura do Monorepo

**ARQUITETURA IDÊNTICA AO MOBILE:**

```
mvppir/
├── apps/
│   ├── server/          # Backend API (Fastify + Prisma) ✅ Existe
│   ├── web/             # Landing page (Next.js) ✅ Existe
│   ├── mobile/          # React Native (Expo) ⚠️ Deprecated
│   └── pwa/             # 🆕 PWA Mobile (Vite + React 19)
│       │
│       ├── src/
│       │   │
│       │   ├── api/                    # 📡 API Layer (IGUAL mobile)
│       │   │   ├── auth/
│       │   │   │   ├── mutations/           # useMutation hooks
│       │   │   │   │   ├── use-login-mutation.ts
│       │   │   │   │   └── use-signup-mutation.ts
│       │   │   │   └── schemas/             # Zod schemas
│       │   │   │       └── auth.schema.ts
│       │   │   │
│       │   │   ├── mlm/
│       │   │   │   ├── client/              # Pure API functions
│       │   │   │   │   └── mlm.api.ts
│       │   │   │   ├── queries/             # useQuery hooks
│       │   │   │   │   ├── use-mlm-profile-query.ts
│       │   │   │   │   ├── use-commissions-summary-query.ts
│       │   │   │   │   └── use-recent-commissions-query.ts
│       │   │   │   └── schemas/             # Zod schemas
│       │   │   │       └── mlm.schema.ts
│       │   │   │
│       │   │   ├── notifications/
│       │   │   │   ├── mutations/
│       │   │   │   │   └── use-register-push-token.ts
│       │   │   │   ├── queries/
│       │   │   │   │   └── use-unread-notifications.ts
│       │   │   │   └── client.ts
│       │   │   │
│       │   │   ├── referral/
│       │   │   │   ├── client/
│       │   │   │   │   └── referral.api.ts
│       │   │   │   └── schemas/
│       │   │   │       └── referral.schema.ts
│       │   │   │
│       │   │   └── user/
│       │   │       ├── client/              # Pure API functions
│       │   │       │   └── user.api.ts
│       │   │       ├── mutations/           # useMutation hooks
│       │   │       │   └── use-request-withdrawal-mutation.ts
│       │   │       ├── queries/             # useQuery hooks
│       │   │       │   ├── use-user-account-query.ts
│       │   │       │   ├── use-user-balance-query.ts
│       │   │       │   ├── use-user-status-query.ts
│       │   │       │   ├── use-deposit-address-query.ts
│       │   │       │   ├── use-user-referral-link-query.ts
│       │   │       │   ├── use-unified-transactions-query.ts
│       │   │       │   ├── use-infinite-unified-transactions-query.ts
│       │   │       │   └── use-calculate-withdrawal-fee-query.ts
│       │   │       └── schemas/
│       │   │           └── user.schema.ts
│       │   │
│       │   ├── components/                 # 🧩 Components (IGUAL mobile)
│       │   │   ├── ui/                          # Base UI components
│       │   │   │   ├── button.tsx
│       │   │   │   ├── input.tsx
│       │   │   │   ├── label.tsx
│       │   │   │   ├── card.tsx
│       │   │   │   ├── badge.tsx
│       │   │   │   ├── alert.tsx
│       │   │   │   ├── skeleton.tsx
│       │   │   │   └── separator.tsx
│       │   │   │
│       │   │   ├── features/                    # Feature components
│       │   │   │   └── DailyCommissionModal.tsx
│       │   │   │
│       │   │   ├── home/                        # Home screen components
│       │   │   │   ├── Header.tsx
│       │   │   │   ├── BalanceCard.tsx
│       │   │   │   ├── QuickActions.tsx
│       │   │   │   ├── RecentActivity.tsx
│       │   │   │   └── ActivationBanner.tsx
│       │   │   │
│       │   │   ├── navigation/                  # Navigation components
│       │   │   │   └── TabBar.tsx
│       │   │   │
│       │   │   ├── referrals/                   # Referrals components
│       │   │   │   ├── RankCard.tsx
│       │   │   │   ├── ReferralCode.tsx
│       │   │   │   ├── NetworkStats.tsx
│       │   │   │   ├── CommissionOverview.tsx
│       │   │   │   ├── RecentCommissions.tsx
│       │   │   │   ├── MLMExplainerModal.tsx
│       │   │   │   └── MonthlyMaintenanceModal.tsx
│       │   │   │
│       │   │   ├── wallet/
│       │   │   │   └── TransactionItem.tsx
│       │   │   │
│       │   │   ├── withdraw/
│       │   │   │   └── DownrankWarningModal.tsx
│       │   │   │
│       │   │   └── Logo.tsx
│       │   │
│       │   ├── screens/                    # 📱 Screens (IGUAL mobile)
│       │   │   ├── auth/
│       │   │   │   ├── LoginScreen.tsx
│       │   │   │   ├── SignupScreen.tsx
│       │   │   │   └── ReferralInputScreen.tsx
│       │   │   │
│       │   │   ├── deposit/
│       │   │   │   └── DepositScreen.tsx
│       │   │   │
│       │   │   ├── home/
│       │   │   │   ├── HomeScreen.tsx
│       │   │   │   └── InactiveAccountScreen.tsx
│       │   │   │
│       │   │   ├── profile/
│       │   │   │   └── ProfileScreen.tsx
│       │   │   │
│       │   │   ├── referrals/
│       │   │   │   └── ReferralsScreen.tsx
│       │   │   │
│       │   │   ├── wallet/
│       │   │   │   └── WalletScreen.tsx
│       │   │   │
│       │   │   └── withdraw/
│       │   │       └── WithdrawScreen.tsx
│       │   │
│       │   ├── hooks/                      # 🪝 Custom Hooks
│       │   │   ├── use-notifications.ts
│       │   │   └── use-install-prompt.ts
│       │   │
│       │   ├── lib/                        # 🛠️ Utilities (IGUAL mobile)
│       │   │   ├── api-client.ts           # ky HTTP client
│       │   │   ├── auth-client.ts          # Better Auth setup
│       │   │   ├── react-query.ts          # TanStack Query setup
│       │   │   ├── design-system.ts        # Design tokens
│       │   │   └── utils.ts                # cn(), formatters, etc
│       │   │
│       │   ├── locales/                    # 🌍 i18n (IGUAL mobile)
│       │   │   ├── en/
│       │   │   │   ├── common/
│       │   │   │   └── features/
│       │   │   ├── es/
│       │   │   │   ├── common/
│       │   │   │   └── features/
│       │   │   ├── fr/
│       │   │   │   ├── common/
│       │   │   │   └── features/
│       │   │   ├── pt/
│       │   │   │   ├── common/
│       │   │   │   └── features/
│       │   │   └── index.ts
│       │   │
│       │   ├── stores/                     # 🗄️ Zustand Stores (IGUAL mobile)
│       │   │   ├── auth.store.ts
│       │   │   └── ui.store.ts
│       │   │
│       │   ├── routes.tsx                  # React Router config
│       │   ├── main.tsx                    # Entry point
│       │   └── global.css                  # Global styles
│       │
│       ├── public/
│       │   ├── manifest.json               # PWA manifest
│       │   ├── sw.js                       # Service worker (auto-generated)
│       │   ├── offline.html                # Offline fallback
│       │   └── icons/                      # App icons
│       │       ├── icon-192x192.png
│       │       ├── icon-512x512.png
│       │       └── apple-touch-icon.png
│       │
│       ├── index.html                      # HTML entry (Vite)
│       ├── vite.config.ts                  # Vite + PWA config
│       ├── tailwind.config.js              # Tailwind CSS config
│       ├── postcss.config.js               # PostCSS config
│       ├── biome.json                      # Biome config
│       ├── tsconfig.json                   # TypeScript config
│       └── package.json                    # Dependencies
```

### 4.2 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                      User Browser                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            Service Worker (Offline Cache)             │  │
│  └─────────────────┬─────────────────────────────────────┘  │
│                    ↓                                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           React 19 App (Components)                   │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  TanStack Query (Server State + Cache)       │    │  │
│  │  └───────────────┬──────────────────────────────┘    │  │
│  │                  ↓                                    │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  API Client (ky HTTP)                        │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│            Backend API (Railway - Existing)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          Fastify + Prisma + PostgreSQL                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Gerenciamento de Estado

**1. Server State (TanStack Query)**
```typescript
// Queries - Read operations
const { data, isLoading } = useUserBalance()

// Mutations - Write operations
const { mutate } = useLoginMutation()
```

**2. Global Client State (Zustand)**
```typescript
// Auth state
const { token, logout } = useAuthStore()

// UI state
const { isBalanceVisible } = useUIStore()
```

**3. Local Component State (useState)**
```typescript
// Ephemeral state
const [isModalOpen, setIsModalOpen] = useState(false)
```

**4. URL State (React Router)**
```typescript
// Navigation params
const { referralCode } = useParams()
const [searchParams] = useSearchParams()
```

### 4.4 React Router Configuration

**Entry Point:**
```typescript
// src/main.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/react-query"
import { router } from "@/routes"
import "@/locales" // Initialize i18n
import "./global.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)
```

**Routes Configuration:**
```typescript
// src/routes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import { useUserStatus } from "@/api/user/queries/use-user-status-query"

// Auth screens
import { LoginScreen } from "@/screens/auth/LoginScreen"
import { SignupScreen } from "@/screens/auth/SignupScreen"
import { ReferralInputScreen } from "@/screens/auth/ReferralInputScreen"

// App screens
import { HomeScreen } from "@/screens/home/HomeScreen"
import { InactiveAccountScreen } from "@/screens/home/InactiveAccountScreen"
import { DepositScreen } from "@/screens/deposit/DepositScreen"
import { WithdrawScreen } from "@/screens/withdraw/WithdrawScreen"
import { ReferralsScreen } from "@/screens/referrals/ReferralsScreen"
import { WalletScreen } from "@/screens/wallet/WalletScreen"
import { ProfileScreen } from "@/screens/profile/ProfileScreen"

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const { data: userStatus } = useUserStatus()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Redirect to inactive screen if account not active
  if (userStatus?.status === "INACTIVE") {
    return <Navigate to="/inactive" replace />
  }

  return <>{children}</>
}

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/login",
    element: <LoginScreen />,
  },
  {
    path: "/signup",
    element: <SignupScreen />,
  },
  {
    path: "/referral-input",
    element: <ReferralInputScreen />,
  },

  // Protected routes
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <HomeScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "/inactive",
    element: (
      <ProtectedRoute>
        <InactiveAccountScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "/deposit",
    element: (
      <ProtectedRoute>
        <DepositScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "/withdraw",
    element: (
      <ProtectedRoute>
        <WithdrawScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "/referrals",
    element: (
      <ProtectedRoute>
        <ReferralsScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "/wallet",
    element: (
      <ProtectedRoute>
        <WalletScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfileScreen />
      </ProtectedRoute>
    ),
  },

  // Fallback
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])
```

---

## 5. Funcionalidades & Telas

**TODAS as telas do mobile serão migradas 1:1**

### 5.1 Telas de Autenticação

#### Login Screen (`/login`)

**Elementos UI:**
- Logo Stakly com brilho azul
- Input email (validação formato)
- Input senha (toggle visibilidade)
- Botão "Entrar"
- Link "Criar conta" → `/referral-input`
- Alert de erro (se houver)

**Funcionalidades:**
- Validação com Zod
- React Hook Form
- Better Auth login
- Armazenar token em Zustand + localStorage
- Redirect para `/` em sucesso

**API:** `POST /api/auth/login`

#### Referral Input Screen (`/referral-input`)

**Elementos UI:**
- Título "Insira o Código de Indicação"
- Input código (uppercase, alfanumérico)
- Botão "Validar"
- Link "Já tem conta?" → `/login`

**Funcionalidades:**
- Validar código com backend
- Navegar para `/signup?referrerId=X&code=Y`

**API:** `POST /api/referral/validate`

#### Signup Screen (`/signup`)

**Elementos UI:**
- Input nome
- Input email
- Input senha
- Input confirmar senha
- Código de indicação (readonly)
- Checkbox termos
- Botão "Criar Conta"

**Funcionalidades:**
- Validação senhas (match, força)
- Auto-login após signup
- Redirect para `/`

**API:** `POST /api/auth/signup`

### 5.2 Telas Principais (Autenticadas)

#### Home Screen (`/`)

**Navegação via Tabs (Bottom):**
- Home (ativo)
- Wallet
- Referrals
- Profile

**Seções Home:**

1. **Header**
   - Avatar → `/profile`
   - Notificações (badge contador)

2. **Balance Card**
   - Saldo total USD
   - Yield mensal %
   - Toggle visibilidade

3. **Quick Actions**
   - Depositar → `/deposit`
   - Sacar → `/withdraw`
   - Indicar → `/referrals`

4. **Recent Activity**
   - 4 transações recentes
   - "Ver todas" → `/wallet`

**APIs:**
- `GET /api/account/profile`
- `GET /api/balance`
- `GET /api/transactions/unified?limit=4`

#### Inactive Account Screen (`/inactive`)

**Elementos:**
- Ícone aviso
- "Conta Não Ativada"
- "Deposite $100+ para ativar"
- Botão → `/deposit`

#### Deposit Screen (`/deposit`)

**Seções:**
- Header com botão voltar
- Banner "Apenas Polygon"
- QR Code (200x200px)
- Endereço da carteira
- Botão "Copiar Endereço"
- Tokens suportados (USDT, USDC)
- Instruções (1-4 steps)
- Avisos (red banner)

**API:** `GET /api/user/deposit-address`

#### Withdraw Screen (`/withdraw`)

**Step 1: Valor**
- Saldo disponível
- Input valor
- Breakdown taxas (base, progressiva, desconto)
- Botão "Próximo"

**Step 2: Endereço**
- Resumo (valor líquido)
- Input endereço Polygon (0x...)
- Botão colar
- Botão "Solicitar Saque"

**Modals:**
- Downrank Warning (se aplicável)
- Success (após confirmação)

**APIs:**
- `GET /api/balance`
- `GET /api/mlm/profile`
- `GET /api/withdrawal/calculate-fee?amount=X`
- `POST /api/withdrawal/request`

#### Referrals Screen (`/referrals`)

**Seções:**
- Rank Card (progresso para próximo)
- Referral Code (copiar/compartilhar)
- Network Stats (diretos, ativos, volume)
- Commission Overview (hoje, mês, total, por nível)
- Recent Commissions (lista 10 itens)

**APIs:**
- `GET /api/mlm/profile`
- `GET /api/mlm/commissions/summary`
- `GET /api/mlm/commissions/recent?limit=10`
- `GET /api/user/referral-link`

#### Wallet Screen (`/wallet`)

**Elementos:**
- Filtros (tipo, data, status)
- Lista transações (infinite scroll)
- Modal detalhes (ao clicar transação)

**API:** `GET /api/transactions/unified?page=1&limit=20`

#### Profile Screen (`/profile`)

**Seções:**
- Avatar + nome + email
- Informações Pessoais
- Alterar Senha
- Idioma (pt/en/es/fr)
- Notificações push
- Logout
- Deletar Conta

**APIs:**
- `GET /api/account/profile`
- `PUT /api/account/profile`
- `PUT /api/account/change-password`

---

## 6. Integração com API

### 6.1 API Client

```typescript
// src/lib/api-client.ts
import ky from "ky"
import { useAuthStore } from "@/stores/auth.store"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333"

export const apiClient = ky.create({
  prefixUrl: API_URL,
  timeout: 30000,
  retry: {
    limit: 2,
    methods: ["get", "post", "put", "delete"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthStore.getState().token
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          useAuthStore.getState().clearAuth()
          window.location.href = "/login"
        }
      },
    ],
  },
})
```

### 6.2 TanStack Query Setup

```typescript
// src/lib/react-query.ts
import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1min
      gcTime: 1000 * 60 * 60 * 24, // 24h
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})
```

### 6.3 Auth Store

```typescript
// src/stores/auth.store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthStore {
  token: string | null
  isAuthenticated: boolean
  setToken: (token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      setToken: (token) => set({ token, isAuthenticated: true }),
      clearAuth: () => set({ token: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    }
  )
)
```

### 6.4 Exemplo de Hook

```typescript
// src/api/user/queries/use-user-balance-query.ts
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

interface BalanceData {
  totalUSD: number
  monthlyYieldPercentage: number
}

export function useUserBalance() {
  return useQuery({
    queryKey: ["user", "balance"],
    queryFn: async () => {
      return apiClient.get("balance").json<BalanceData>()
    },
    staleTime: 1000 * 30, // 30s
    refetchInterval: 1000 * 60, // 1min
  })
}
```

---

## 7. Capacidades PWA

### 7.1 Manifest

```json
{
  "name": "Stakly - Staking & MLM",
  "short_name": "Stakly",
  "description": "Plataforma de staking com recompensas MLM",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#09090B",
  "theme_color": "#3b82f6",
  "orientation": "portrait",
  "lang": "pt-BR",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["finance", "business"],
  "shortcuts": [
    {
      "name": "Depositar",
      "url": "/deposit",
      "icons": [{ "src": "/icons/deposit-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "Sacar",
      "url": "/withdraw",
      "icons": [{ "src": "/icons/withdraw-96x96.png", "sizes": "96x96" }]
    }
  ]
}
```

### 7.2 Vite PWA Config

```typescript
// vite.config.ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import { VitePWA } from "vite-plugin-pwa"
import path from "path"

export default defineConfig({
  plugins: [
    react(), // SWC para compilação mais rápida
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Stakly - Staking & MLM",
        short_name: "Stakly",
        theme_color: "#3b82f6",
        background_color: "#09090B",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/mvppir-production\.up\.railway\.app\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1h
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30d
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3001,
  },
})
```

### 7.3 Push Notifications (Web Push API)

**Frontend:**
```typescript
// src/hooks/use-notifications.ts
import { useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export function useNotifications() {
  const registerPushMutation = useMutation({
    mutationFn: async (subscription: PushSubscription) => {
      return apiClient.post("notifications/register", { json: subscription }).json()
    },
  })

  useEffect(() => {
    async function setupPushNotifications() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return
      }

      const permission = await Notification.requestPermission()
      if (permission !== "granted") return

      const registration = await navigator.serviceWorker.register("/sw.js")

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      })

      await registerPushMutation.mutateAsync(subscription)
    }

    setupPushNotifications()
  }, [])
}
```

**Backend (alterações necessárias):**
- Substituir Expo Push por Web Push Protocol
- Gerar VAPID keys (`npx web-push generate-vapid-keys`)
- Armazenar subscriptions (não apenas Expo tokens)
- Enviar notificações via Web Push API

### 7.4 Install Prompt

```typescript
// src/hooks/use-install-prompt.ts
import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setIsInstallable(false)
    }

    setDeferredPrompt(null)
  }

  return { isInstallable, promptInstall }
}
```

---

## 8. Estratégia de Migração

### Fase 1: Setup (Semana 1)

**Tarefas:**
1. Criar `apps/pwa/` no monorepo
2. Inicializar Vite + React 19 + TypeScript 5.9
3. Configurar Tailwind CSS, Biome, PWA plugin
4. Copiar stores do mobile (Zustand)
5. Copiar lib do mobile (api-client, react-query, utils)
6. Setup React Router
7. Criar layout base
8. Testar build

**Entregas:**
- ✅ App rodando em `localhost:3001`
- ✅ Hot reload funcionando
- ✅ Build production gerando PWA

### Fase 2: Autenticação (Semana 2)

**Tarefas:**
1. Copiar telas auth do mobile
2. Adaptar componentes RN → React
3. Copiar API hooks de auth
4. Testar login/signup flow
5. Adicionar persist de token
6. Testar PWA installable

**Entregas:**
- ✅ Login funcionando
- ✅ Signup funcionando
- ✅ Token persistido
- ✅ PWA instalável

### Fase 3: Dashboard + Deposit/Withdraw (Semana 3-4)

**Tarefas:**
1. Copiar HomeScreen do mobile
2. Copiar componentes home (Header, BalanceCard, etc)
3. Copiar API hooks user
4. Copiar DepositScreen
5. Copiar WithdrawScreen
6. Testar fluxos completos

**Entregas:**
- ✅ Dashboard funcionando
- ✅ Deposit screen funcionando
- ✅ Withdraw screen funcionando

### Fase 4: MLM + Wallet + Profile (Semana 5)

**Tarefas:**
1. Copiar ReferralsScreen
2. Copiar componentes referrals
3. Copiar API hooks MLM
4. Copiar WalletScreen
5. Copiar ProfileScreen
6. Testar tudo

**Entregas:**
- ✅ Todas telas funcionando
- ✅ 100% paridade com mobile

### Fase 5: Push Notifications (Semana 6)

**Tarefas:**
1. Implementar Web Push API
2. Atualizar backend para Web Push
3. Testar notificações iOS/Android
4. Adicionar notification handlers

**Entregas:**
- ✅ Push notifications funcionando

### Fase 6: Polish (Semana 7)

**Tarefas:**
1. Install prompt customizado
2. Otimizar assets
3. Loading skeletons
4. Tratamento de erros
5. Testes em dispositivos reais

**Entregas:**
- ✅ UX polida
- ✅ Performance ótima

### Fase 7: Deploy (Semana 8)

**Tarefas:**
1. Testes end-to-end iOS Safari
2. Testes end-to-end Android Chrome
3. Deploy para produção
4. Monitorar

**Entregas:**
- ✅ PWA em produção
- ✅ URL pública funcionando

---

## 9. Critérios de Sucesso

### Performance
- ✅ FCP < 1.5s
- ✅ TTI < 3.0s
- ✅ LCP < 2.5s
- ✅ CLS < 0.1
- ✅ Lighthouse PWA > 90

### Funcional
- ✅ 100% paridade com mobile
- ✅ Instalável iOS + Android
- ✅ Push notifications funcionando
- ✅ Offline core features

### UX
- ✅ Indistinguível de app nativo
- ✅ 60fps animações
- ✅ Mobile-first responsivo

### Segurança
- ✅ Sem contas de desenvolvedor
- ✅ Hosting anônimo possível
- ✅ Sem rastreamento

---

## 10. Deploy

### Hosting

**Opção 1: Vercel**
- Deploy automático do GitHub
- HTTPS automático
- CDN global

**Opção 2: Cloudflare Pages**
- Melhor privacidade
- CDN global

**Opção 3: VPS Self-Hosted**
- Anonimato total
- Pagar com crypto

### Environment Variables

```env
VITE_API_URL=https://mvppir-production.up.railway.app
VITE_VAPID_PUBLIC_KEY=YOUR_KEY_HERE
VITE_ENV=production
```

### Build Commands

```bash
cd apps/pwa
pnpm install
pnpm build
# Output: apps/pwa/dist/
```

---

## 11. Dependências (package.json)

**NOTA:** As versões abaixo serão substituídas por `latest` no momento da criação do projeto. Os números indicados são apenas referência das versões usadas no mobile.

```json
{
  "name": "@mvppir/pwa",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write ."
  },
  "dependencies": {
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-router-dom": "latest",
    "@tanstack/react-query": "^5.90.5",
    "@tanstack/react-query-persist-client": "latest",
    "zustand": "^5.0.8",
    "ky": "^1.13.0",
    "zod": "^3.24.2",
    "react-hook-form": "^7.65.0",
    "@hookform/resolvers": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-slot": "latest",
    "@radix-ui/react-switch": "latest",
    "@radix-ui/react-tabs": "latest",
    "phosphor-react": "latest",
    "framer-motion": "latest",
    "jsqr": "latest",
    "qrcode": "latest",
    "better-auth": "^1.3.28",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "date-fns": "latest",
    "i18next": "^25.6.0",
    "react-i18next": "^16.2.1"
  },
  "devDependencies": {
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@vitejs/plugin-react-swc": "latest",
    "typescript": "~5.9.2",
    "vite": "latest",
    "vite-plugin-pwa": "latest",
    "tailwindcss": "latest",
    "autoprefixer": "latest",
    "postcss": "latest",
    "@biomejs/biome": "latest"
  }
}
```

---

## Conclusão

Este PWA oferece:

1. ✅ **Anonimato Total** - Sem exposição de identidade
2. ✅ **Zero Custos** - Sem taxas Apple/Google
3. ✅ **Deploy Instantâneo** - Sem app store review
4. ✅ **100% Paridade** - Todas features do mobile
5. ✅ **Performance 90%+** - Experiência nativa
6. ✅ **Arquitetura Idêntica** - Código 80% reutilizável

**Prazo:** 8 semanas
**Stack:** React + Vite + TypeScript + Biome (todas as versões latest stable)
**Arquitetura:** Idêntica ao mobile existente

**Próximos passos:** Aprovação para iniciar Fase 1 (Setup)
