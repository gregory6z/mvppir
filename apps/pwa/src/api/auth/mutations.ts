import { useMutation } from "@tanstack/react-query"
import { signIn, signUp } from "@/lib/auth-client"
import { useAuthStore } from "@/stores/auth.store"
import type { LoginInput, SignupInput } from "./schemas"

// Chaves de tradução para erros de login (i18n) - caminhos relativos ao namespace "auth.login"
export type LoginError =
  | "errors.invalidCredentials"
  | "errors.accountBlocked"
  | "errors.networkError"
  | "errors.unknownError"

// Chaves de tradução para erros de cadastro (i18n) - caminhos relativos ao namespace "auth.signup"
export type SignupError =
  | "errors.emailExists"
  | "errors.invalidReferral"
  | "errors.networkError"
  | "errors.unknownError"

// Função helper para transformar erros de login em chaves de tradução
export function transformLoginError(error: any): LoginError {
  // Trata erros de rede (servidor offline, timeout, etc)
  if (error instanceof TypeError && error.message?.includes("fetch")) {
    return "errors.networkError"
  }

  // Trata erros do Better Auth
  const errorCode = error?.code

  if (
    errorCode === "INVALID_EMAIL_OR_PASSWORD" ||
    errorCode === "INVALID_PASSWORD" ||
    errorCode === "USER_NOT_FOUND"
  ) {
    return "errors.invalidCredentials"
  }

  if (errorCode === "ACCOUNT_BLOCKED") {
    return "errors.accountBlocked"
  }

  // Erro desconhecido
  return "errors.unknownError"
}

// Função helper para transformar erros de cadastro em chaves de tradução
export function transformSignupError(error: any): SignupError {
  // Trata erros de rede (servidor offline, timeout, etc)
  if (error instanceof TypeError && error.message?.includes("fetch")) {
    return "errors.networkError"
  }

  // Trata erros do Better Auth (verificando error.code)
  const errorCode = error?.code
  const errorMessage = error?.message?.toLowerCase() || ""

  // Códigos de erro oficiais do Better Auth
  if (errorCode === "USER_ALREADY_EXISTS") {
    return "errors.emailExists"
  }

  if (errorCode === "BAD_REQUEST") {
    // Verifica se é erro de referral no BAD_REQUEST
    if (errorMessage.includes("invalid referral") || errorMessage.includes("referral code")) {
      return "errors.invalidReferral"
    }
    return "errors.unknownError"
  }

  if (errorCode === "INVALID_EMAIL") {
    return "errors.unknownError"
  }

  // Fallback: verifica mensagem se código não vier
  if (errorMessage.includes("already exists") || errorMessage.includes("already registered")) {
    return "errors.emailExists"
  }

  if (errorMessage.includes("invalid referral") || errorMessage.includes("referral code")) {
    return "errors.invalidReferral"
  }

  // Erro desconhecido
  return "errors.unknownError"
}

export function useLoginMutation() {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      })

      // Se houver erro, lança o erro bruto para ser tratado no onError
      if (result.error) {
        throw result.error
      }

      if (!result.data?.token || !result.data?.user) {
        throw new Error("MISSING_DATA")
      }

      return result.data
    },
    onSuccess: (data) => {
      // Salva o token no Zustand (para usar como Bearer token)
      setAuth(data.token, data.user.id)
    },
  })
}

export function useSignupMutation() {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: async (data: SignupInput) => {
      const result = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        // @ts-ignore - Better Auth supports additional fields
        referralCode: data.referralCode?.toUpperCase(),
      })

      // Se houver erro, lança o erro bruto para ser tratado no onError
      if (result.error) {
        throw result.error
      }

      if (!result.data?.token || !result.data?.user) {
        throw new Error("MISSING_DATA")
      }

      return result.data
    },
    onSuccess: (data) => {
      // Salva o token no Zustand (para usar como Bearer token)
      setAuth(data.token, data.user.id)
    },
  })
}
