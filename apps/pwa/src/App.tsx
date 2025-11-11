import { Routes, Route, Navigate } from "react-router-dom"
import { useSession } from "@/lib/auth-client"
import { LoginScreen } from "@/screens/auth/LoginScreen"
import { SignupScreen } from "@/screens/auth/SignupScreen"
import { InviteScreen } from "@/screens/auth/InviteScreen"
import { HomeScreen } from "@/screens/home/HomeScreen"

export function App() {
  // Better Auth gerencia a sessão via cookies - usa useSession hook
  const { data: session, isPending } = useSession()

  console.log("🔍 App render - session:", session, "isPending:", isPending)

  // Mostra loading enquanto verifica sessão
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não há sessão, mostra rotas de auth
  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/invite" element={<InviteScreen />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Se há sessão, mostra rotas da app
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/profile" element={<div>Profile (TODO)</div>} />
      <Route path="/notifications" element={<div>Notifications (TODO)</div>} />
      <Route path="/deposit" element={<div>Deposit (TODO)</div>} />
      <Route path="/withdraw" element={<div>Withdraw (TODO)</div>} />
      <Route path="/refer" element={<div>Refer (TODO)</div>} />
      <Route path="/transactions" element={<div>Transactions (TODO)</div>} />
      <Route path="/transactions/:id" element={<div>Transaction Detail (TODO)</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
