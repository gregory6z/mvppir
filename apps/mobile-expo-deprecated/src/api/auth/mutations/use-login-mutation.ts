import { useMutation } from "@tanstack/react-query";
import { signIn } from "@/lib/auth-client";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginInput } from "@/api/auth/schemas/auth.schema";

// Chaves de tradução para erros (i18n) - caminhos relativos ao namespace "auth.login"
type LoginError =
  | "errors.invalidCredentials"
  | "errors.accountBlocked"
  | "errors.networkError"
  | "errors.unknownError";

// Função helper para transformar erros em chaves de tradução
function transformLoginError(error: any): LoginError {
  // Trata erros de rede (servidor offline, timeout, etc)
  if (error instanceof TypeError && error.message?.includes("fetch")) {
    return "errors.networkError";
  }

  // Trata erros do Better Auth
  const errorCode = error?.code;

  if (
    errorCode === "INVALID_EMAIL_OR_PASSWORD" ||
    errorCode === "INVALID_PASSWORD" ||
    errorCode === "USER_NOT_FOUND"
  ) {
    return "errors.invalidCredentials";
  }

  if (errorCode === "ACCOUNT_BLOCKED") {
    return "errors.accountBlocked";
  }

  // Erro desconhecido
  return "errors.unknownError";
}

export function useLoginMutation() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });

      // Se houver erro, lança o erro bruto para ser tratado no onError
      if (result.error) {
        throw result.error;
      }

      if (!result.data?.token || !result.data?.user) {
        throw new Error("MISSING_DATA");
      }

      return result.data;
    },
    onSuccess: (data) => {
      // Atualiza o estado de autenticação
      setAuth(data.token, data.user.id);
    },
  });
}

export { transformLoginError };
export type { LoginError };
