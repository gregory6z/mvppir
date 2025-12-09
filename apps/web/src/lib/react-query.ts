import { QueryClient } from "@tanstack/react-query"

// Query keys centralizadas
export const queryKeys = {
  // Admin
  admin: {
    all: ["admin"] as const,
    globalWallet: () => [...queryKeys.admin.all, "global-wallet"] as const,
    withdrawals: (status?: string, page?: number) =>
      [...queryKeys.admin.all, "withdrawals", { status, page }] as const,
    batchCollect: {
      preview: () => [...queryKeys.admin.all, "batch-collect", "preview"] as const,
      history: (limit?: number) =>
        [...queryKeys.admin.all, "batch-collect", "history", { limit }] as const,
      status: (jobId: string) =>
        [...queryKeys.admin.all, "batch-collect", "status", jobId] as const,
    },
  },
  // Auth
  auth: {
    session: ["auth", "session"] as const,
  },
} as const

// Query client com configuração otimizada para admin dashboard
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 24 horas (garbage collection)
      gcTime: 1000 * 60 * 60 * 24,
      // Dados ficam "fresh" por 2 minutos
      staleTime: 1000 * 60 * 2,
      // Retry 2x em caso de erro
      retry: 2,
      // Refetch quando a janela ganha foco
      refetchOnWindowFocus: true,
      // Refetch quando reconecta à internet
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Helper para invalidar queries por grupo
export const invalidateAdminQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.all })
}

export const invalidateWithdrawals = () => {
  queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] })
}

export const invalidateBatchCollect = () => {
  queryClient.invalidateQueries({ queryKey: ["admin", "batch-collect"] })
}
