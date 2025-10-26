import { z } from "zod"

export const adminLoginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(8, "Senha deve ter no mínimo 8 caracteres"),
})

export type AdminLoginInput = z.infer<typeof adminLoginSchema>
