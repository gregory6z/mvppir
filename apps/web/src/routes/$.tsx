import { createFileRoute, Navigate } from "@tanstack/react-router"
import { AdminLoginForm } from "@/components/admin/admin-login-form"

// UUID secreto vem do .env - não aparece no routeTree como rota nomeada
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET

export const Route = createFileRoute("/$")({
  component: CatchAllRoute,
})

function CatchAllRoute() {
  const { _splat } = Route.useParams()

  // Só mostra login se for exatamente o UUID secreto
  if (_splat === ADMIN_SECRET) {
    return (
      <div className="relative min-h-screen bg-zinc-950 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="relative z-10 px-4">
          <AdminLoginForm />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </div>
    )
  }

  // Qualquer outra rota não encontrada -> redireciona para home
  return <Navigate to="/" />
}
