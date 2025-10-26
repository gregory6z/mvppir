import type { GlobalWalletBalance } from "@/api/queries/admin/use-global-wallet-query"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Erro desconhecido",
    }))
    throw new Error(error.message || "Falha na requisição")
  }

  return response.json()
}

// Admin Global Wallet Services
export async function getGlobalWalletBalance(
  page = 1,
  limit = 10
): Promise<GlobalWalletBalance> {
  return request<GlobalWalletBalance>(
    `/admin/global-wallet/balance?page=${page}&limit=${limit}`
  )
}

// Admin Batch Collect Services
export interface BatchCollectPreview {
  tokens: Array<{
    tokenSymbol: string
    walletsCount: number
    totalAmount: string
    gasEstimate: string
    priceUsd: number
    valueUsd: number
  }>
  totalGasEstimate: string
  maticBalance: string
  canExecute: boolean
  totalValueUsd: number
}

export async function getBatchCollectPreview(): Promise<BatchCollectPreview> {
  return request<BatchCollectPreview>("/admin/batch-collect/preview")
}

export async function executeBatchCollect(): Promise<{ jobId: string; status: string }> {
  return request<{ jobId: string; status: string }>("/transfer/batch-collect", {
    method: "POST",
  })
}

export interface BatchCollectJobStatus {
  jobId: string
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED"
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

export async function getBatchCollectStatus(jobId: string): Promise<BatchCollectJobStatus> {
  return request<BatchCollectJobStatus>(`/admin/batch-collect/status/${jobId}`)
}

export interface BatchCollectHistoryItem {
  id: string
  createdAt: string
  tokenSymbol: string
  totalCollected: string
  walletsCount: number
  status: "COMPLETED" | "FAILED" | "PARTIAL"
  txHashes: string[]
  executedBy?: {
    id: string
    name: string
    email: string
  }
}

export async function getBatchCollectHistory(
  limit = 20
): Promise<{ history: BatchCollectHistoryItem[] }> {
  return request<{ history: BatchCollectHistoryItem[] }>(
    `/admin/batch-collect/history?limit=${limit}`
  )
}
