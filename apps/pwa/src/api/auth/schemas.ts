import { z } from "zod"
import i18n from "@/locales"

// Helper to get translated validation messages
const t = (key: string, params?: Record<string, any>) => {
  return i18n.t(key, { ns: "auth.validation", ...params })
}

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, t("email.required"))
    .email(t("email.invalid")),
  password: z
    .string()
    .min(1, t("password.required"))
    .min(8, t("password.minLength", { min: 8 })),
})

const signupBaseSchema = z.object({
  name: z
    .string()
    .min(1, t("name.required"))
    .min(3, t("name.minLength", { min: 3 })),
  email: z
    .string()
    .min(1, t("email.required"))
    .email(t("email.invalid")),
  password: z
    .string()
    .min(1, t("password.required"))
    .min(8, t("password.minLength", { min: 8 })),
  passwordConfirm: z
    .string()
    .min(1, t("passwordConfirm.required")),
  referralCode: z.string().optional(),
})

export const signupSchema = signupBaseSchema.refine(
  (data) => data.password === data.passwordConfirm,
  {
    message: t("passwordConfirm.mismatch"),
    path: ["passwordConfirm"],
  }
)

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
