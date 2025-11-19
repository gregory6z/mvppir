import { ArrowDown, ArrowUp, UserPlus, ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { LucideIcon } from "lucide-react"

interface Action {
  id: "deposit" | "withdraw" | "refer"
  label: string
  icon: LucideIcon
  onPress: () => void
}

interface QuickActionsProps {
  onDepositPress: () => void
  onWithdrawPress: () => void
  onReferPress: () => void
}

export function QuickActions({
  onDepositPress,
  onWithdrawPress,
  onReferPress,
}: QuickActionsProps) {
  const { t } = useTranslation("home.home")

  const actions: Action[] = [
    {
      id: "deposit",
      label: t("quickActions.deposit"),
      icon: ArrowDown,
      onPress: onDepositPress,
    },
    {
      id: "withdraw",
      label: t("quickActions.withdraw"),
      icon: ArrowUp,
      onPress: onWithdrawPress,
    },
    {
      id: "refer",
      label: t("quickActions.refer"),
      icon: UserPlus,
      onPress: onReferPress,
    },
  ]

  return (
    <div className="mx-6 mt-6 max-w-7xl">
      {/* Title */}
      <h2 className="text-white text-base font-semibold mb-4">
        {t("quickActions.title")}
      </h2>

      {/* Actions Grid */}
      <div className="flex flex-col gap-3">
        {/* First Row - Deposit and Withdraw */}
        <div className="flex gap-3">
          {actions.slice(0, 2).map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={action.onPress}
                className="flex-1 bg-zinc-900/80 backdrop-blur-xl min-h-[52px] rounded-2xl border border-zinc-800 flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-[0.98] transition-all"
                aria-label={action.label}
              >
                <Icon size={20} className="text-purple-500" strokeWidth={2.5} />
                <span className="text-white font-semibold text-sm">
                  {action.label}
                </span>
                <ChevronRight size={16} className="text-zinc-500" strokeWidth={2.5} />
              </button>
            )
          })}
        </div>

        {/* Second Row - Refer Friends (full width) */}
        {actions.slice(2).map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={action.onPress}
              className="bg-gradient-to-r from-purple-500 via-[#D445E7] to-purple-600 min-h-[52px] rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(139,92,246,0.4)]"
              aria-label={action.label}
            >
              <Icon size={20} className="text-white" strokeWidth={2.5} />
              <span className="text-white font-bold text-sm">
                {action.label}
              </span>
              <ChevronRight size={16} className="text-white/70" strokeWidth={2.5} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
