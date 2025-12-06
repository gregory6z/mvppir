import { Link, useLocation } from "@tanstack/react-router"
import {
  LayoutDashboard,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

const menuItems = [
  {
    label: "Dashboard",
    href: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Depositar",
    href: "/app/deposit",
    icon: ArrowDownToLine,
  },
  {
    label: "Sacar",
    href: "/app/withdraw",
    icon: ArrowUpFromLine,
  },
  {
    label: "Transações",
    href: "/app/transactions",
    icon: History,
  },
  {
    label: "Meus Saques",
    href: "/app/withdrawals",
    icon: Wallet,
  },
  {
    label: "Indicações",
    href: "/app/referral",
    icon: Users,
  },
]

export function UserSidebar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/"
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-zinc-900 border-zinc-700"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          w-64 h-screen bg-zinc-900 border-r border-zinc-800
          transform transition-transform duration-200 ease-in-out
          flex flex-col
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex-shrink-0 p-6 border-b border-zinc-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-white">MVPPIR</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-purple-600/20 text-purple-400 border border-purple-600/30"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout - Always at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-zinc-800 mt-auto">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}
