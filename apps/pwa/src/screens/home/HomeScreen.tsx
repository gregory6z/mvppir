import { useAuthStore } from "@/stores/auth.store"

// Placeholder HomeScreen (será implementado na Fase 3 - Dashboard)
export function HomeScreen() {
  const { clearAuth } = useAuthStore()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
      <div className="rounded-lg bg-zinc-900 p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Tela Principal</h1>
        <p className="mt-2 text-zinc-400">PWA autenticado com sucesso! ✅</p>
        <button
          onClick={clearAuth}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
        >
          Sair
        </button>
      </div>
    </div>
  )
}
