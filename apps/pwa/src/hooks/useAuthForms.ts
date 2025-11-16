import { useForm, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from "@/api/auth/schemas"

/**
 * Pre-typed form hook for login to avoid TypeScript deep instantiation errors
 */
export function useLoginForm(): UseFormReturn<LoginInput> {
  return useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  })
}

/**
 * Pre-typed form hook for signup to avoid TypeScript deep instantiation errors
 */
export function useSignupForm(referralCode = ""): UseFormReturn<SignupInput> {
  return useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      referralCode,
    },
    mode: "onBlur",
  })
}
