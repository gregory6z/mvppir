import ky from "ky"

const API_URL =
  import.meta.env.VITE_API_URL || "https://mvppir-production.up.railway.app"

// Ky instance configurada para a API
export const apiClient = ky.create({
  prefixUrl: API_URL,
  timeout: 30000, // 30 segundos
  credentials: "include", // IMPORTANTE: Envia cookies para o backend
  retry: {
    limit: 2,
    methods: ["get", "post"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // Better Auth usa cookies, não precisamos adicionar Bearer token manualmente
        // Os cookies são enviados automaticamente com credentials: "include"
        if (import.meta.env.DEV) {
          console.log(`[API] ${request.method} ${request.url}`)
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // Log de requisições em desenvolvimento
        if (import.meta.env.DEV) {
          console.log(`[API] ${request.method} ${request.url} - ${response.status}`)
        }

        // Se 401, o Better Auth vai detectar automaticamente e limpar a sessão
        if (response.status === 401) {
          console.warn("🚫 401 Unauthorized - Better Auth will handle session cleanup")
        }

        return response
      },
    ],
  },
})
