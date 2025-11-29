# Folder Structure - Next.js App Router (Feature-Based)

## Filosofia

- **Feature-based organization** - Componentes agrupados por domínio de negócio
- **API layer centralizado** - Schemas, clients, queries separados
- **Colocation** - Colocar arquivos relacionados próximos
- **Separation of concerns** - Server vs Client, UI vs Business Logic

---

## Structure Overview

```
apps/web/
├── src/
│   ├── app/                           # Next.js App Router (file-based routing)
│   │   ├── layout.tsx                 # Root layout (providers, theme)
│   │   ├── page.tsx                   # Landing page (/)
│   │   ├── globals.css                # Global styles (Tailwind)
│   │   │
│   │   ├── admin/                     # Admin section
│   │   │   ├── [uuid]/                # Hidden login route
│   │   │   │   └── page.tsx           # Login page
│   │   │   │
│   │   │   ├── dashboard/             # Protected admin dashboard
│   │   │   │   ├── layout.tsx         # Dashboard layout (sidebar, header)
│   │   │   │   ├── page.tsx           # Overview (/admin/dashboard)
│   │   │   │   │
│   │   │   │   ├── withdrawals/       # Withdrawals management
│   │   │   │   │   ├── page.tsx       # List withdrawals
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx   # Withdrawal details
│   │   │   │   │   └── loading.tsx    # Loading state
│   │   │   │   │
│   │   │   │   ├── users/             # Users management
│   │   │   │   │   ├── page.tsx       # List users
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx   # User details
│   │   │   │   │   └── loading.tsx
│   │   │   │   │
│   │   │   │   ├── transactions/      # Transactions history
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── loading.tsx
│   │   │   │   │
│   │   │   │   └── settings/          # Admin settings
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── access-denied/
│   │   │       └── page.tsx           # 403 page
│   │   │
│   │   └── api/                       # API routes (opcional, se precisar)
│   │       └── webhooks/
│   │           └── route.ts           # Webhooks endpoint
│   │
│   ├── components/                    # Components layer
│   │   ├── ui/                        # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── form.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   │
│   │   ├── features/                  # ✅ Feature-based components
│   │   │   ├── auth/                  # Authentication feature
│   │   │   │   ├── login-form.tsx
│   │   │   │   └── auth-provider.tsx
│   │   │   │
│   │   │   ├── withdrawals/           # Withdrawals feature
│   │   │   │   ├── withdrawals-table.tsx
│   │   │   │   ├── withdrawal-details.tsx
│   │   │   │   ├── dialogs/
│   │   │   │   │   ├── approve-dialog.tsx
│   │   │   │   │   └── reject-dialog.tsx
│   │   │   │   └── forms/
│   │   │   │       └── withdrawal-filter-form.tsx
│   │   │   │
│   │   │   ├── users/                 # Users feature
│   │   │   │   ├── users-table.tsx
│   │   │   │   ├── user-details.tsx
│   │   │   │   ├── dialogs/
│   │   │   │   │   ├── block-user-dialog.tsx
│   │   │   │   │   └── unblock-user-dialog.tsx
│   │   │   │   └── forms/
│   │   │   │       └── user-filter-form.tsx
│   │   │   │
│   │   │   ├── transactions/          # Transactions feature
│   │   │   │   ├── transactions-table.tsx
│   │   │   │   ├── transaction-details.tsx
│   │   │   │   └── forms/
│   │   │   │       └── transaction-filter-form.tsx
│   │   │   │
│   │   │   └── dashboard/             # Dashboard feature
│   │   │       ├── metrics-card.tsx
│   │   │       ├── stats-overview.tsx
│   │   │       └── recent-transactions.tsx
│   │   │
│   │   ├── navigation/                # Navigation components
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── admin-header.tsx
│   │   │   └── user-menu.tsx
│   │   │
│   │   ├── layouts/                   # Layout components
│   │   │   ├── auth-layout.tsx
│   │   │   └── dashboard-layout.tsx
│   │   │
│   │   ├── shared/                    # Shared/reusable components
│   │   │   ├── data-table.tsx         # Generic table component
│   │   │   ├── empty-state.tsx
│   │   │   └── error-boundary.tsx
│   │   │
│   │   └── skeletons/                 # Loading states
│   │       ├── table-skeleton.tsx
│   │       ├── card-skeleton.tsx
│   │       └── metrics-skeleton.tsx
│   │
│   ├── api/                           # ✅ API Layer (CRITICAL)
│   │   ├── schemas/                   # Zod schemas + TypeScript types
│   │   │   ├── withdrawal.schema.ts   # Withdrawal validation schemas
│   │   │   ├── user.schema.ts         # User validation schemas
│   │   │   ├── transaction.schema.ts  # Transaction validation schemas
│   │   │   └── common.schema.ts       # Shared schemas (pagination, etc.)
│   │   │
│   │   ├── client/                    # HTTP clients (axios instances)
│   │   │   ├── withdrawal.api.ts      # Withdrawal API calls
│   │   │   ├── user.api.ts            # User API calls
│   │   │   ├── transaction.api.ts     # Transaction API calls
│   │   │   ├── auth.api.ts            # Auth API calls
│   │   │   └── admin.api.ts           # Admin API calls
│   │   │
│   │   └── queries/                   # TanStack Query hooks
│   │       ├── withdrawals/
│   │       │   ├── use-withdrawals-query.ts
│   │       │   ├── use-withdrawal-query.ts
│   │       │   ├── use-approve-withdrawal-mutation.ts
│   │       │   └── use-reject-withdrawal-mutation.ts
│   │       │
│   │       ├── users/
│   │       │   ├── use-users-query.ts
│   │       │   ├── use-user-query.ts
│   │       │   ├── use-block-user-mutation.ts
│   │       │   └── use-unblock-user-mutation.ts
│   │       │
│   │       ├── transactions/
│   │       │   └── use-transactions-query.ts
│   │       │
│   │       └── admin/
│   │           └── use-admin-metrics-query.ts
│   │
│   ├── lib/                           # Core utilities and config
│   │   ├── api-client.ts              # Axios instance with interceptors
│   │   ├── query-client.ts            # TanStack Query client config
│   │   ├── auth.ts                    # Better Auth client
│   │   ├── utils.ts                   # cn() and utilities
│   │   └── constants.ts               # App constants
│   │
│   ├── hooks/                         # Custom React hooks (non-query)
│   │   ├── use-auth.ts                # Auth session hook
│   │   ├── use-toast.ts               # Toast notifications
│   │   └── use-pagination.ts          # Pagination logic
│   │
│   ├── config/                        # App configuration
│   │   └── env.ts                     # Environment variables (client-side)
│   │
│   ├── types/                         # TypeScript types and interfaces
│   │   ├── api.ts                     # API response types
│   │   ├── models.ts                  # Domain models
│   │   └── shared.ts                  # Shared types
│   │
│   ├── providers/                     # React context providers
│   │   ├── query-provider.tsx         # TanStack Query provider
│   │   ├── theme-provider.tsx         # Theme provider (next-themes)
│   │   └── toast-provider.tsx         # Toast provider
│   │
│   └── middleware.ts                  # Next.js middleware (route protection)
│
├── public/                            # Static assets
│   ├── images/
│   └── favicon.ico
│
├── docs/                              # Documentation
│   ├── PRD-ADMIN-v1.md
│   ├── CACHE-STRATEGY.md
│   └── FOLDER-STRUCTURE.md
│
├── components.json                    # shadcn/ui config
├── tailwind.config.ts                 # Tailwind config
├── tsconfig.json                      # TypeScript config
├── next.config.js                     # Next.js config
└── package.json                       # Dependencies
```

---

## Key Differences from TanStack Router Structure

| Aspect | TanStack Router | Next.js App Router |
|--------|-----------------|-------------------|
| **Routes** | `routes/` folder | `app/` folder (file-based) |
| **Protected Routes** | `_authenticated.tsx` wrapper | `middleware.ts` + layouts |
| **Layouts** | Manual wrapper components | `layout.tsx` (nested) |
| **Loading States** | Manual in route | `loading.tsx` (automatic) |
| **Error Handling** | Manual error boundaries | `error.tsx` (automatic) |
| **Route Groups** | Folder naming | `(group)` syntax |
| **Auth Check** | Route-level HOC | Middleware + Server Components |

---

## Detailed Breakdown

### 1. App Router (`app/`)

#### Next.js 13+ File Conventions

```
app/
├── layout.tsx       → Root layout (wraps all pages)
├── page.tsx         → Route page
├── loading.tsx      → Automatic loading UI
├── error.tsx        → Error boundary
└── not-found.tsx    → 404 page
```

#### Protected Routes Pattern

```typescript
// middleware.ts (route protection)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin/dashboard/* routes
  if (pathname.startsWith('/admin/dashboard')) {
    const session = await getSession(request)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/access-denied', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

#### Nested Layouts

```typescript
// app/admin/dashboard/layout.tsx
import { AdminSidebar } from '@/components/navigation/admin-sidebar'
import { AdminHeader } from '@/components/navigation/admin-header'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
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

---

### 2. API Layer (`api/`)

#### 2.1 Schemas (`api/schemas/`)

**Purpose:** Zod schemas for validation + TypeScript type inference

```typescript
// api/schemas/withdrawal.schema.ts
import { z } from 'zod'

// Request schemas
export const withdrawalFilterSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SENT']).optional(),
  userId: z.string().uuid().optional(),
  tokenSymbol: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export const approveWithdrawalSchema = z.object({
  id: z.string().uuid(),
  adminNote: z.string().optional(),
})

export const rejectWithdrawalSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(1, 'Reason is required'),
})

// Response schemas
export const withdrawalSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  tokenSymbol: z.string(),
  amount: z.string(),
  toAddress: z.string(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SENT']),
  txHash: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const withdrawalsResponseSchema = z.object({
  withdrawals: z.array(withdrawalSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
})

// Export types
export type WithdrawalFilter = z.infer<typeof withdrawalFilterSchema>
export type ApproveWithdrawal = z.infer<typeof approveWithdrawalSchema>
export type RejectWithdrawal = z.infer<typeof rejectWithdrawalSchema>
export type Withdrawal = z.infer<typeof withdrawalSchema>
export type WithdrawalsResponse = z.infer<typeof withdrawalsResponseSchema>
```

#### 2.2 Clients (`api/client/`)

**Purpose:** HTTP calls with axios (typed)

```typescript
// api/client/withdrawal.api.ts
import { apiClient } from '@/lib/api-client'
import type {
  WithdrawalFilter,
  WithdrawalsResponse,
  ApproveWithdrawal,
  RejectWithdrawal
} from '@/api/schemas/withdrawal.schema'

export const withdrawalApi = {
  getAll: async (filters: WithdrawalFilter): Promise<WithdrawalsResponse> => {
    return apiClient.get('/admin/withdrawals', { params: filters })
  },

  getById: async (id: string) => {
    return apiClient.get(`/admin/withdrawals/${id}`)
  },

  approve: async (data: ApproveWithdrawal) => {
    return apiClient.post(`/admin/withdrawals/${data.id}/approve`, {
      adminNote: data.adminNote
    })
  },

  reject: async (data: RejectWithdrawal) => {
    return apiClient.post(`/admin/withdrawals/${data.id}/reject`, {
      reason: data.reason
    })
  },
}
```

#### 2.3 Queries (`api/queries/`)

**Purpose:** TanStack Query hooks (queries + mutations)

```typescript
// api/queries/withdrawals/use-withdrawals-query.ts
import { useQuery } from '@tanstack/react-query'
import { withdrawalApi } from '@/api/client/withdrawal.api'
import type { WithdrawalFilter } from '@/api/schemas/withdrawal.schema'

export function useWithdrawalsQuery(filters: WithdrawalFilter) {
  return useQuery({
    queryKey: ['admin', 'withdrawals', filters],
    queryFn: () => withdrawalApi.getAll(filters),
    staleTime: 10000,
  })
}
```

```typescript
// api/queries/withdrawals/use-approve-withdrawal-mutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { withdrawalApi } from '@/api/client/withdrawal.api'
import type { ApproveWithdrawal } from '@/api/schemas/withdrawal.schema'

export function useApproveWithdrawalMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ApproveWithdrawal) => withdrawalApi.approve(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] })
    },
  })
}
```

---

### 3. Components Layer (`components/`)

#### 3.1 Features (`components/features/`)

**Purpose:** Feature-specific components (domain-driven)

```
components/features/
├── withdrawals/
│   ├── withdrawals-table.tsx      # Main table component
│   ├── withdrawal-row.tsx         # Table row component
│   ├── withdrawal-details.tsx     # Details view
│   ├── dialogs/
│   │   ├── approve-dialog.tsx     # Approve modal
│   │   └── reject-dialog.tsx      # Reject modal
│   └── forms/
│       └── withdrawal-filter-form.tsx  # Filter form
```

**Example:**

```typescript
// components/features/withdrawals/withdrawals-table.tsx
'use client'

import { useWithdrawalsQuery } from '@/api/queries/withdrawals/use-withdrawals-query'
import { WithdrawalRow } from './withdrawal-row'
import { TableSkeleton } from '@/components/skeletons/table-skeleton'

export function WithdrawalsTable({ filters }) {
  const { data, isLoading } = useWithdrawalsQuery(filters)

  if (isLoading) return <TableSkeleton />

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.withdrawals.map(withdrawal => (
          <WithdrawalRow key={withdrawal.id} withdrawal={withdrawal} />
        ))}
      </TableBody>
    </Table>
  )
}
```

#### 3.2 UI (`components/ui/`)

**Purpose:** shadcn/ui primitives (button, input, card, etc.)

```
components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
├── form.tsx
├── table.tsx
├── dialog.tsx
├── dropdown-menu.tsx
└── ... (shadcn components)
```

#### 3.3 Shared (`components/shared/`)

**Purpose:** Reusable components (cross-feature)

```typescript
// components/shared/data-table.tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
}

export function DataTable<T>({ columns, data, isLoading }: DataTableProps<T>) {
  // Generic table implementation
}
```

---

### 4. Library (`lib/`)

**Purpose:** Core utilities and configuration

```typescript
// lib/api-client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/admin/access-denied'
    }
    return Promise.reject(error)
  }
)
```

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
      gcTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
})

export function getQueryClient() {
  return queryClient
}
```

---

## Page Examples

### Admin Dashboard Page

```typescript
// app/admin/dashboard/page.tsx
import { Suspense } from 'react'
import { MetricsCards } from '@/components/features/dashboard/metrics-cards'
import { RecentTransactions } from '@/components/features/dashboard/recent-transactions'
import { MetricsSkeleton } from '@/components/skeletons/metrics-skeleton'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsCards />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <RecentTransactions />
      </Suspense>
    </div>
  )
}
```

### Withdrawals Page

```typescript
// app/admin/dashboard/withdrawals/page.tsx
'use client'

import { useState } from 'react'
import { WithdrawalsTable } from '@/components/features/withdrawals/withdrawals-table'
import { WithdrawalFilterForm } from '@/components/features/withdrawals/forms/withdrawal-filter-form'

export default function WithdrawalsPage() {
  const [filters, setFilters] = useState({ status: 'PENDING', page: 1, limit: 20 })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Saques</h1>
      </div>

      <WithdrawalFilterForm onFilterChange={setFilters} />
      <WithdrawalsTable filters={filters} />
    </div>
  )
}
```

---

## Benefits of This Structure

1. **Feature-based organization** - Easy to find related code
2. **Clear separation** - API, components, pages are isolated
3. **Type safety** - Zod schemas → TypeScript types
4. **Reusability** - Shared components, hooks, utilities
5. **Scalability** - Easy to add new features
6. **Maintainability** - Clear patterns and conventions
7. **Testability** - Each layer can be tested independently

---

## Migration from Legacy Hooks

```typescript
// OLD (hooks/use-withdrawals.ts)
export function useWithdrawals() {
  return useQuery({
    queryKey: ['withdrawals'],
    queryFn: fetchWithdrawals,
  })
}

// NEW (api/queries/withdrawals/use-withdrawals-query.ts)
export function useWithdrawalsQuery(filters: WithdrawalFilter) {
  return useQuery({
    queryKey: ['admin', 'withdrawals', filters],
    queryFn: () => withdrawalApi.getAll(filters),
  })
}
```

---

**Last Updated:** 2025-10-26
**Reference:** Inspired by TanStack Router best practices, adapted for Next.js App Router
