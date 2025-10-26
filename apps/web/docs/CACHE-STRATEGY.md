# Estratégia de Cache: Next.js vs TanStack Query

## 1. Resumo Executivo

| Aspecto | Next.js Cache (Server) | TanStack Query (Client) | **Híbrido (Recomendado)** |
|---------|------------------------|-------------------------|---------------------------|
| **Local** | Server-side (RSC) | Client-side (Browser) | Server prefetch → Client hydration |
| **Melhor para** | Dados estáticos/semi-estáticos | Dados dinâmicos + Mutations | Admin dashboards, apps complexas |
| **SEO** | ✅ Excelente | ❌ Não indexável | ✅ Server Components garantem SEO |
| **Invalidação** | Via tags ou tempo | Granular por queryKey | Ambos (server + client) |
| **Mutations** | ❌ Precisa de Server Actions | ✅ useMutation nativo | ✅ TanStack Query Client |
| **Optimistic Updates** | ❌ Complexo | ✅ Trivial | ✅ TanStack Query Client |
| **Real-time** | ❌ Precisa de revalidation | ✅ Polling/refetch automático | ✅ TanStack Query Client |
| **Performance Inicial** | ⚡ Muito rápido (SSR) | 🐌 Precisa de hydration | ⚡ Server prefetch elimina waterfall |

### ⚠️ IMPORTANTE: Next.js 15 Mudou o Comportamento Padrão

**Antes (Next.js 14 e anteriores):**
- `fetch()` em Server Components tinha cache **ATIVADO** por padrão
- Precisava usar `cache: 'no-store'` para desabilitar

**Agora (Next.js 15+):**
- `fetch()` tem cache **DESABILITADO** por padrão
- Use directive `'use cache'` para opt-in em cache
- Novo sistema `dynamicIO` para gerenciamento fino
- **Filosofia:** Developer controla cache explicitamente

Fonte: [Next.js 15 Caching](https://uniquedevs.com/en/blog/how-does-caching-work-in-next-js-15/)

---

## 2. Next.js Cache (Server Components + fetch)

### Como Funciona

```typescript
// app/example/page.tsx (Server Component)
export default async function Page() {
  // Cache automático por padrão
  const data = await fetch('http://localhost:3333/api/data', {
    next: { revalidate: 60 } // Revalidate a cada 60s
  })

  return <div>{data.title}</div>
}
```

**Características:**
- Executa no servidor (sem JavaScript no cliente)
- Cache compartilhado entre todos os usuários
- Revalidação via tempo (`revalidate`) ou tags (`cache: 'force-cache'`)
- Dados renderizados no HTML inicial (SEO excelente)

### Quando Usar

✅ **Bom para:**
- Páginas públicas (Landing Page, Blog, Docs)
- Dados que mudam raramente (< 1x por minuto)
- SEO é crítico
- Primeira renderização precisa ser instantânea
- Dados iguais para todos os usuários

❌ **Ruim para:**
- Dados específicos do usuário (sessão)
- Atualizações em tempo real
- Formulários com mutations
- Dados que mudam com frequência (> 1x por minuto)
- Optimistic updates

### Exemplo Real: Landing Page

```typescript
// app/page.tsx (Landing Page - USAR Next.js Cache)
export default async function HomePage() {
  // Dados estáticos da landing page
  const stats = await fetch('http://localhost:3333/api/public/stats', {
    next: { revalidate: 300 } // Atualiza a cada 5 minutos
  }).then(r => r.json())

  return (
    <section>
      <h1>Plataforma de Criptomoedas</h1>
      <p>Usuários: {stats.totalUsers}</p>
      <p>Volume: ${stats.totalVolume}</p>
    </section>
  )
}
```

**Vantagens aqui:**
- Google indexa os números (SEO)
- Primeira renderização é instantânea (SSR)
- Cache compartilhado reduz carga no backend
- Dados mudam pouco (stats gerais)

---

## 3. TanStack Query (Client Components)

### Como Funciona

```typescript
'use client'

import { useQuery, useMutation } from '@tanstack/react-query'

export function WithdrawalsPage() {
  // Cache client-side, específico do usuário
  const { data, isLoading } = useQuery({
    queryKey: ['withdrawals', { status: 'PENDING' }],
    queryFn: () => apiClient.get('/admin/withdrawals'),
    refetchInterval: 10000, // Atualiza a cada 10s
  })

  const approve = useMutation({
    mutationFn: (id) => apiClient.post(`/admin/withdrawals/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
    }
  })

  return (
    <div>
      {data?.withdrawals.map(w => (
        <button onClick={() => approve.mutate(w.id)}>Aprovar</button>
      ))}
    </div>
  )
}
```

**Características:**
- Executa no cliente (após hydration)
- Cache separado por usuário/sessão
- Invalidação granular por `queryKey`
- Suporta mutations com invalidação automática
- Optimistic updates triviais

### Quando Usar

✅ **Bom para:**
- Dashboards administrativos
- Dados específicos do usuário (balanço, transações)
- CRUD operations (aprovar/rejeitar, editar, deletar)
- Atualizações frequentes (polling, real-time)
- Interações do usuário (filtros, paginação)
- Optimistic updates

❌ **Ruim para:**
- SEO é crítico
- Páginas públicas que podem ser estáticas
- Primeira renderização precisa ser instantânea

### Exemplo Real: Admin Dashboard

```typescript
'use client'

// app/admin/dashboard/withdrawals/page.tsx (USAR TanStack Query)
export default function WithdrawalsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'withdrawals', { status: 'PENDING' }],
    queryFn: () => apiClient.get('/admin/withdrawals', {
      params: { status: 'PENDING' }
    }),
    refetchInterval: 30000, // Refetch a cada 30s
    staleTime: 10000, // Considera fresco por 10s
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/admin/withdrawals/${id}/approve`),
    onMutate: async (id) => {
      // Optimistic update (UI atualiza ANTES do servidor responder)
      await queryClient.cancelQueries({ queryKey: ['admin', 'withdrawals'] })
      const previous = queryClient.getQueryData(['admin', 'withdrawals'])

      queryClient.setQueryData(['admin', 'withdrawals'], (old: any) => ({
        ...old,
        withdrawals: old.withdrawals.map((w: any) =>
          w.id === id ? { ...w, status: 'APPROVED' } : w
        )
      }))

      return { previous }
    },
    onError: (err, variables, context) => {
      // Reverte se der erro
      queryClient.setQueryData(['admin', 'withdrawals'], context?.previous)
    },
    onSuccess: () => {
      // Invalidate queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] })
    }
  })

  return (
    <Table>
      {data?.withdrawals.map(w => (
        <Button
          onClick={() => approveMutation.mutate(w.id)}
          disabled={approveMutation.isPending}
        >
          Aprovar
        </Button>
      ))}
    </Table>
  )
}
```

**Vantagens aqui:**
- Mutations com invalidação automática
- Optimistic updates (UI instantânea)
- Polling automático (dados sempre frescos)
- Loading/error states por query
- Cache separado por usuário (segurança)

---

## 4. Decisão por Feature (Projeto mvppir)

### Admin Dashboard (TanStack Query ✅)

| Feature | Estratégia | Motivo |
|---------|------------|--------|
| **Login Form** | Client Component (sem cache) | Form submission, validação client-side |
| **Dashboard Overview** | TanStack Query | Métricas atualizam frequentemente, polling |
| **Saques (CRUD)** | TanStack Query | Mutations (aprovar/rejeitar) + optimistic updates |
| **Usuários (CRUD)** | TanStack Query | Mutations (bloquear/desbloquear) + filtros |
| **Transações (Lista)** | TanStack Query | Filtros dinâmicos + paginação client-side |

**Por que TanStack Query domina aqui:**
1. **Mutations são frequentes** (aprovar/rejeitar saques)
2. **Dados mudam constantemente** (novos depósitos, saques)
3. **Invalidação granular** (aprovar saque → atualiza métricas + lista de saques)
4. **Optimistic updates** (UX instantânea)
5. **Polling** (admin quer ver dados em tempo real)

### Landing Page (Next.js Cache ✅)

| Feature | Estratégia | Motivo |
|---------|------------|--------|
| **Hero Section** | Server Component | Conteúdo estático, SEO |
| **Stats Gerais** | Server Component + revalidate | Dados semi-estáticos (atualiza 1x a cada 5min) |
| **Pricing Table** | Server Component | Conteúdo estático, SEO |
| **FAQ** | Server Component | Conteúdo estático, SEO |
| **CTA Buttons** | Client Component | Interação do usuário |

**Por que Next.js Cache aqui:**
1. **SEO é crítico** (Google precisa indexar)
2. **Dados estáticos/semi-estáticos** (mudam raramente)
3. **Performance inicial** (SSR = carregamento instantâneo)
4. **Cache compartilhado** (reduz carga no backend)

### User Dashboard (TanStack Query ✅)

| Feature | Estratégia | Motivo |
|---------|------------|--------|
| **Saldo (Balance)** | TanStack Query | Dados específicos do usuário, atualizam com depósitos |
| **Histórico de Transações** | TanStack Query | Filtros, paginação |
| **Solicitar Saque** | TanStack Query Mutation | Form submission + invalidação |
| **Endereço de Depósito** | TanStack Query | Dados específicos do usuário |

---

## 5. Padrão Híbrido: Melhor dos Dois Mundos

Você pode **combinar** ambas as estratégias:

### Exemplo: Página de Transações

```typescript
// app/admin/dashboard/transactions/page.tsx
import { TransactionsTable } from './transactions-table' // Client Component

// Server Component (shell inicial)
export default async function TransactionsPage() {
  // Buscar dados iniciais no servidor (SSR)
  const initialData = await fetch('http://localhost:3333/api/admin/transactions', {
    cache: 'no-store' // Sem cache (dados sempre frescos)
  }).then(r => r.json())

  return (
    <div>
      <h1>Transações</h1>
      {/* Client Component com TanStack Query + dados iniciais */}
      <TransactionsTable initialData={initialData} />
    </div>
  )
}
```

```typescript
'use client'

// transactions-table.tsx (Client Component)
export function TransactionsTable({ initialData }) {
  const { data } = useQuery({
    queryKey: ['admin', 'transactions'],
    queryFn: () => apiClient.get('/admin/transactions'),
    initialData, // Usa dados do SSR como initial state
    refetchInterval: 30000,
  })

  return <Table data={data.transactions} />
}
```

**Vantagens:**
- ✅ SSR para primeira renderização (rápido)
- ✅ TanStack Query para updates subsequentes (polling, mutations)
- ✅ Sem loading spinner na primeira carga

---

## 6. Recomendação Final para mvppir

### MVP v1.0 (Admin Dashboard)

**Usar TanStack Query 100%**

Motivos:
1. Dashboard é privado (SEO irrelevante)
2. Mutations são críticas (aprovar/rejeitar saques)
3. Dados mudam frequentemente (novos depósitos)
4. Optimistic updates melhoram UX
5. Polling mantém dados frescos

**Estrutura:**
```
app/admin/
├── [uuid]/
│   └── page.tsx              ← Client Component (form, sem cache)
└── dashboard/
    ├── layout.tsx            ← Server Component (shell)
    ├── page.tsx              ← Client Component + TanStack Query
    ├── withdrawals/
    │   └── page.tsx          ← Client Component + TanStack Query
    ├── users/
    │   └── page.tsx          ← Client Component + TanStack Query
    └── transactions/
        └── page.tsx          ← Client Component + TanStack Query
```

### Futuro: Landing Page + User Dashboard

**Landing Page:** Next.js Cache (Server Components)
**User Dashboard:** TanStack Query (Client Components)

---

## 7. Configuração Recomendada

### TanStack Query Setup

```typescript
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10000,           // Considera fresco por 10s
        gcTime: 1000 * 60 * 5,      // Garbage collect após 5min
        retry: 1,                    // Retry 1x em caso de erro
        refetchOnWindowFocus: true,  // Refetch ao voltar para a tab
      },
      mutations: {
        retry: 0, // Não retry mutations automaticamente
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

```typescript
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

### Next.js Cache Config

```typescript
// next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      dynamic: 0,      // Admin pages: sem cache
      static: 300,     // Static pages: 5min
    },
  },
}
```

---

## 8. Comparação de Performance

### Cenário: Listar 100 saques pendentes

#### Next.js Cache (Server Component)
```
1️⃣ Usuário acessa /admin/dashboard/withdrawals
2️⃣ Next.js verifica cache (HIT)
3️⃣ HTML renderizado instantaneamente (0ms)
4️⃣ Dados podem estar desatualizados (último revalidate)

Total: ~50ms (inicial) | Cache: 60s
❌ Problema: Admin vê dados desatualizados até próximo revalidate
```

#### TanStack Query (Client Component)
```
1️⃣ Usuário acessa /admin/dashboard/withdrawals
2️⃣ HTML shell renderizado (200ms hydration)
3️⃣ TanStack Query busca dados (300ms API call)
4️⃣ Dados sempre frescos (staleTime: 10s)

Total: ~500ms (inicial) | Auto-refetch: 30s
✅ Vantagem: Dados sempre atualizados + Mutations
```

### Veredito

Para **admin dashboard**, vale a pena sacrificar 450ms iniciais para ter:
- ✅ Dados sempre frescos
- ✅ Mutations com optimistic updates
- ✅ Invalidação granular
- ✅ Loading/error states por query

---

## 9. Checklist de Decisão

Ao criar uma nova página, pergunte:

**Usar Next.js Cache se:**
- [ ] Página é pública (SEO importa)
- [ ] Dados são estáticos ou mudam raramente (> 1min)
- [ ] Mesmos dados para todos os usuários
- [ ] Não há mutations (apenas leitura)
- [ ] Performance inicial é crítica

**Usar TanStack Query se:**
- [x] Página é privada (admin/user dashboard)
- [x] Dados são dinâmicos (mudam frequentemente)
- [x] Dados são específicos do usuário
- [x] Há mutations (criar/editar/deletar)
- [x] Precisa de optimistic updates
- [x] Precisa de polling/real-time

---

## 10. Conclusão

Para o **mvppir Admin Dashboard v1.0:**

**🎯 Usar TanStack Query 100%**

Benefícios:
1. Mutations nativas (aprovar/rejeitar saques)
2. Optimistic updates (UX instantânea)
3. Invalidação automática (aprovar saque → atualiza métricas)
4. Polling (dados sempre frescos)
5. Cache client-side (segurança - dados não compartilhados)

**Quando implementar Landing Page (futuro):**
- Landing: Next.js Cache (Server Components)
- User Dashboard: TanStack Query (Client Components)

---

**Última atualização:** 2025-10-26
