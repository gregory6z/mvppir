import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getBatchCollectPreview,
  executeBatchCollect,
  getBatchCollectHistory,
  getBatchCollectStatus,
} from "@/api/client/admin.api"

export function useBatchCollectPreview() {
  return useQuery({
    queryKey: ["admin", "batch-collect", "preview"],
    queryFn: getBatchCollectPreview,
    refetchInterval: 30000, // Auto-refresh a cada 30s
    staleTime: 10000,
  })
}

export function useExecuteBatchCollect() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: executeBatchCollect,
    onSuccess: () => {
      // Invalidar preview para atualizar após execução
      queryClient.invalidateQueries({ queryKey: ["admin", "batch-collect", "preview"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "batch-collect", "history"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "global-wallet"] })
    },
  })
}

export function useBatchCollectHistory(limit = 20) {
  return useQuery({
    queryKey: ["admin", "batch-collect", "history", limit],
    queryFn: () => getBatchCollectHistory(limit),
    refetchInterval: 60000, // Auto-refresh a cada 60s
  })
}

export function useBatchCollectJobStatus(jobId: string | null, enabled = false) {
  return useQuery({
    queryKey: ["admin", "batch-collect", "status", jobId],
    queryFn: () => getBatchCollectStatus(jobId!),
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      // Continuar polling se estiver PENDING ou IN_PROGRESS
      if (status === "PENDING" || status === "IN_PROGRESS") {
        return 3000 // Poll a cada 3s
      }
      return false // Parar polling quando COMPLETED ou FAILED
    },
  })
}
