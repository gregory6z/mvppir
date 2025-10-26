"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  LogOut,
  TrendingUp
} from "lucide-react"
import { signOut } from "@/hooks/use-auth"

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Carteira Global",
    href: "/admin/global-wallet",
    icon: Wallet,
  },
  {
    title: "Coleta em Lote",
    href: "/admin/batch-collect",
    icon: ArrowLeftRight,
  },
  {
    title: "Saques",
    href: "/admin/withdrawals",
    icon: TrendingUp,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/"
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/10 bg-zinc-950">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-gradient-to-br from-white/60 to-white flex items-center justify-center">
            <span className="text-zinc-950 font-bold text-sm">M</span>
          </div>
          <span className="font-bold text-lg text-white">MVPPIR</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="border-t border-white/10 p-4">
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start gap-3 text-zinc-400 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  )
}
