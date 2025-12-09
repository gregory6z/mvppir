import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const adminLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

type AdminLoginForm = z.infer<typeof adminLoginSchema>

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

export const Route = createFileRoute("/e001153a-ea55-4aaf-939a-feac4a3aea86")({
  component: AdminLoginPage,
})

function AdminLoginPage() {
  const navigate = useNavigate()
  const { signInEmail } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<LoginError | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
  })

  const onSubmit = async (data: AdminLoginForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signInEmail({
        email: data.email,
        password: data.password,
      })

      console.log("Login result:", result)

      if (result.error) {
        if (result.error.message?.includes("Invalid credentials")) {
          setError("INVALID_CREDENTIALS")
        } else if (result.error.message?.includes("not admin")) {
          setError("NOT_ADMIN")
        } else if (result.error.message?.includes("blocked")) {
          setError("ACCOUNT_BLOCKED")
        } else {
          setError("UNKNOWN_ERROR")
        }
        setIsLoading(false)
        return
      }

      // Login bem-sucedido - aguarda um pouco para o cookie ser setado
      // e depois redireciona usando window.location para garantir reload completo
      setTimeout(() => {
        window.location.href = "/admin/dashboard"
      }, 100)
    } catch (err) {
      console.error("Erro no login:", err)
      setError("NETWORK_ERROR")
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 flex items-center justify-center overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />

      {/* Glow effects */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "700ms" }} />

      {/* Content */}
      <div className="relative z-10 px-4 w-full max-w-md">
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <CardHeader className="space-y-2 pb-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Acesso Administrativo
            </CardTitle>
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
                  Senha
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
                  <AlertDescription>{errorMessages[error]}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium transition-all duration-200"
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
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
    </div>
  )
}
