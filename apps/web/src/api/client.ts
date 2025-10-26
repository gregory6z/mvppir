/**
 * API Client
 * Base fetch wrapper para comunicação com o backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}/api${endpoint}`, {
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
