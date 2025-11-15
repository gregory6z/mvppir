import ky from "ky"
import { useAuthStore } from "@/stores/auth.store"

const API_URL =
  import.meta.env.VITE_API_URL || "https://mvppir-production.up.railway.app"

// Ky instance configurada para a API
export const apiClient = ky.create({
  prefixUrl: API_URL,
  timeout: 30000, // 30 segundos
  credentials: "include", // Tenta usar cookies se disponíveis
  retry: {
    limit: 2,
    methods: ["get", "post"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // Adiciona Bearer token se existir (fallback quando cookies não funcionam)
        const token = useAuthStore.getState().token
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        // Se 401 (não autenticado), limpa o token
        if (response.status === 401) {
          useAuthStore.getState().clearAuth()
        }

        return response
      },
    ],
  },
})
