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

      // Tratamento de erros baseado nos códigos oficiais do Better Auth
      if (result.error) {
        const errorCode = (result.error as any).code;

        // Log para debug (pode ser removido em produção)
        console.log("🔍 Better Auth Error Code:", errorCode);
        console.log("🔍 Error Message:", result.error.message);

        // Mapeia códigos do Better Auth para chaves de tradução
        if (errorCode === "USER_ALREADY_EXISTS") {
          throw new Error("auth.signup.errors.emailExists");
        } else if (
          errorCode === "INVALID_EMAIL" ||
          errorCode === "FAILED_TO_CREATE_USER"
        ) {
          // Códigos que podem indicar problema com referral
          throw new Error("auth.signup.errors.unknownError");
        } else {
          // Qualquer outro erro
          throw new Error("auth.signup.errors.unknownError");
        }
      }

      if (!result.data?.token || !result.data?.user) {
        throw new Error("auth.signup.errors.unknownError");
      }

      return result.data;
    },
    onSuccess: (data) => {
      // Atualiza o estado de autenticação
      setAuth(data.token, data.user.id);
    },
    onError: (error) => {
      console.error("❌ Erro no cadastro:", error);
    },
  });
}

export type { SignupError };
