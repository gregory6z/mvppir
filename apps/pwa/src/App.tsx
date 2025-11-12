import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import { LoginScreen } from "@/screens/auth/LoginScreen"
import { SignupScreen } from "@/screens/auth/SignupScreen"
import { InviteScreen } from "@/screens/auth/InviteScreen"
import { HomeScreen } from "@/screens/home/HomeScreen"
import { WalletScreen } from "@/screens/wallet/WalletScreen"
import { NetworkScreen } from "@/screens/network/NetworkScreen"
import { ProfileScreen } from "@/screens/profile/ProfileScreen"
import { DepositScreen } from "@/screens/deposit/DepositScreen"
import { WithdrawScreen } from "@/screens/withdraw/WithdrawScreen"
import { NotificationsScreen } from "@/screens/notifications/NotificationsScreen"
import { TransactionDetailScreen } from "@/screens/transactions/TransactionDetailScreen"
import { ReferScreen } from "@/screens/refer/ReferScreen"

export function App() {
  // Usa authStore com token Bearer (fallback quando cookies cross-origin não funcionam)
  const { isAuthenticated } = useAuthStore()

  console.log("🔍 App render - isAuthenticated:", isAuthenticated)

  // Se não está autenticado, mostra rotas de auth
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/invite" element={<InviteScreen />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Se está autenticado, mostra rotas da app
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/wallet" element={<WalletScreen />} />
      <Route path="/network" element={<NetworkScreen />} />
      <Route path="/profile" element={<ProfileScreen />} />
      <Route path="/notifications" element={<NotificationsScreen />} />
      <Route path="/deposit" element={<DepositScreen />} />
      <Route path="/withdraw" element={<WithdrawScreen />} />
      <Route path="/refer" element={<ReferScreen />} />
      <Route path="/transactions" element={<div>Transactions List (TODO)</div>} />
      <Route path="/transactions/:id" element={<TransactionDetailScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
