import { useMutation } from "@tanstack/react-query";
import { signIn } from "@/lib/auth-client";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginInput } from "@/api/schemas/auth.schema";

// Chaves de tradução para erros (i18n)
type LoginError =
  | "auth.login.errors.invalidCredentials"
  | "auth.login.errors.accountBlocked"
  | "auth.login.errors.networkError"
  | "auth.login.errors.unknownError";

export function useLoginMutation() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });

      // Tratamento de erros baseado nos códigos oficiais do Better Auth
      if (result.error) {
        const errorCode = (result.error as any).code;

        // Log para debug (pode ser removido em produção)
        console.log("🔍 Better Auth Error Code:", errorCode);
        console.log("🔍 Error Message:", result.error.message);

        // Mapeia códigos do Better Auth para chaves de tradução
        if (
          errorCode === "INVALID_EMAIL_OR_PASSWORD" ||
          errorCode === "INVALID_PASSWORD" ||
          errorCode === "USER_NOT_FOUND"
        ) {
          throw new Error("auth.login.errors.invalidCredentials");
        } else if (errorCode === "ACCOUNT_BLOCKED") {
          // Código customizado do servidor (se implementado)
          throw new Error("auth.login.errors.accountBlocked");
        } else {
          // Qualquer outro erro
          throw new Error("auth.login.errors.unknownError");
        }
      }

      if (!result.data?.token || !result.data?.user) {
        throw new Error("auth.login.errors.unknownError");
      }

      return result.data;
    },
    onSuccess: (data) => {
      // Atualiza o estado de autenticação
      setAuth(data.token, data.user.id);
    },
    onError: (error) => {
      console.error("❌ Erro no login:", error);
    },
  });
}

export type { LoginError };
