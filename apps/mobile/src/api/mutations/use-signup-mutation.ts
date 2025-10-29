import { useMutation } from "@tanstack/react-query";
import { signUp } from "@/lib/auth-client";
import { useAuthStore } from "@/stores/auth.store";
import type { SignupInput } from "@/api/schemas/auth.schema";

// Chaves de tradução para erros (i18n)
type SignupError =
  | "auth.signup.errors.emailExists"
  | "auth.signup.errors.invalidReferral"
  | "auth.signup.errors.networkError"
  | "auth.signup.errors.unknownError";

// Função helper para transformar erros em chaves de tradução
function transformSignupError(error: any): SignupError {
  // Trata erros de rede (servidor offline, timeout, etc)
  if (error instanceof TypeError && error.message?.includes("fetch")) {
    return "auth.signup.errors.networkError";
  }

  // Trata erros do Better Auth
  const errorCode = error?.code;

  if (errorCode === "USER_ALREADY_EXISTS") {
    return "auth.signup.errors.emailExists";
  }

  if (errorCode === "INVALID_EMAIL" || errorCode === "FAILED_TO_CREATE_USER") {
    return "auth.signup.errors.unknownError";
  }

  // Erro desconhecido
  return "auth.signup.errors.unknownError";
}

export function useSignupMutation() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (data: SignupInput) => {
      // Remove passwordConfirm before sending to backend
      const { passwordConfirm, ...signupData } = data;

      const result = await signUp.email({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        // @ts-ignore - Better Auth supports additional fields
        referralCode: signupData.referralCode?.toUpperCase(),
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

export { transformSignupError };
export type { SignupError };
