import { BottomNavigation } from "@/components/navigation/BottomNavigation"
import { Header } from "@/components/layout/Header"
import { useNavigate } from "react-router-dom"

export function NetworkScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Header
        userName="User"
        notificationCount={0}
        onAvatarPress={() => navigate("/profile")}
        onNotificationPress={() => navigate("/notifications")}
      />

      <div className="flex-1 flex items-center justify-center pb-24">
        <div className="text-center px-6">
          <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-purple-500 text-5xl">🌐</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">Rede</h1>
          <p className="text-zinc-400">Em desenvolvimento</p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}
