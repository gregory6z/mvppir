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
