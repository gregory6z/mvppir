import ky from "ky";
import { useAuthStore } from "@/stores/auth.store";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3333";

// Ky instance configurada para a API
export const apiClient = ky.create({
  prefixUrl: API_URL,
  timeout: 30000, // 30 segundos
  retry: {
    limit: 2,
    methods: ["get", "post"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // Adiciona token de autenticação se existir
        const token = useAuthStore.getState().token;
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // Log de requisições em desenvolvimento
        if (process.env.NODE_ENV === "development") {
          console.log(`[API] ${request.method} ${request.url} - ${response.status}`);
        }

        // Se 401 (não autenticado), limpa o token
        if (response.status === 401) {
          useAuthStore.getState().clearAuth();
        }

        return response;
      },
    ],
  },
});
