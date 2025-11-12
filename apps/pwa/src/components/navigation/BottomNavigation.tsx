import { Home, Wallet, Users, User } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

export function BottomNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation("common.navigation")

  const tabs = [
    {
      key: "home",
      label: t("home"),
      icon: Home,
      path: "/",
    },
    {
      key: "wallet",
      label: t("wallet"),
      icon: Wallet,
      path: "/wallet",
    },
    {
      key: "referrals",
      label: t("referrals"),
      icon: Users,
      path: "/network",
    },
    {
      key: "profile",
      label: t("profile"),
      icon: User,
      path: "/profile",
    },
  ]

  const handleTabPress = (path: string) => {
    navigate(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 z-50">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-around h-20">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path
            const Icon = tab.icon

            return (
              <button
                key={tab.key}
                onClick={() => handleTabPress(tab.path)}
                className={`flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-purple-500"
                    : "text-zinc-400 hover:text-zinc-300"
                }`}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? "text-purple-500" : ""}
                />
                <span
                  className={`text-[11px] font-medium ${
                    isActive ? "text-purple-500" : "text-zinc-400"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
