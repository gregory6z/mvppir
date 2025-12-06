import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "@tanstack/react-router"
import { signInEmail } from "@/lib/auth-client"
import { adminLoginSchema, type AdminLoginInput } from "@/api/schemas/admin-login.schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

type LoginError =
  | "INVALID_CREDENTIALS"
  | "NOT_ADMIN"
  | "ACCOUNT_BLOCKED"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR"

const errorMessages: Record<LoginError, string> = {
  INVALID_CREDENTIALS: "Email ou senha incorretos",
  NOT_ADMIN: "Acesso negado. Apenas administradores podem acessar.",
  ACCOUNT_BLOCKED: "Sua conta foi bloqueada. Entre em contato com o suporte.",
  NETWORK_ERROR: "Erro de conexão. Tente novamente.",
  UNKNOWN_ERROR: "Erro desconhecido. Tente novamente.",
}

export function AdminLoginForm() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<LoginError | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>()

  const onSubmit = async (data: AdminLoginInput) => {
    setIsLoading(true)
    setError(null)

    // Manual validation using Zod
    const validationResult = adminLoginSchema.safeParse(data)
    if (!validationResult.success) {
      setIsLoading(false)
      setError("INVALID_CREDENTIALS")
      return
    }

    try {
      const result = await signInEmail({
        email: data.email,
        password: data.password,
      })

      console.log("Login result:", result)

      // better-auth retorna { data, error }
      if (result.error) {
        const errorMessage = result.error.message || ""
        if (errorMessage.includes("Invalid credentials")) {
          setError("INVALID_CREDENTIALS")
        } else if (errorMessage.includes("not admin")) {
          setError("NOT_ADMIN")
        } else if (errorMessage.includes("blocked")) {
          setError("ACCOUNT_BLOCKED")
        } else {
          setError("UNKNOWN_ERROR")
        }
        setIsLoading(false)
        return
      }

      // Login bem-sucedido - redireciona
      navigate({ to: "/admin/dashboard" })
    } catch (err) {
      console.error("❌ Erro no login:", err)
      setError("NETWORK_ERROR")
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight">Acesso Administrativo</CardTitle>
        <CardDescription className="text-zinc-400">
          Digite suas credenciais para acessar o painel administrativo
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              disabled={isLoading}
              className="bg-white/5 border-white/10 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:border-purple-500/40 transition-all duration-200"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-200">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              className="bg-white/5 border-white/10 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:border-purple-500/40 transition-all duration-200"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <Alert className="border-red-900/50 bg-red-950/50 text-red-200">
              {errorMessages[error]}
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-b from-white/60 to-white hover:from-white/70 hover:to-white/90 text-zinc-950 font-medium shadow-sm border-t border-white/80 transition-all duration-200 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
