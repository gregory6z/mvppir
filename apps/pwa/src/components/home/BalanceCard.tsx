import { Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react"
import { useTranslation } from "react-i18next"

interface BalanceCardProps {
  totalBalance: number // USD
  percentChange?: number // -100 to +100
  period?: "day" | "week" | "month"
  isBalanceVisible: boolean
  onToggleVisibility: () => void
}

export function BalanceCard({
  totalBalance,
  percentChange = 0,
  period = "month",
  isBalanceVisible,
  onToggleVisibility,
}: BalanceCardProps) {
  const { t } = useTranslation("home.home")

  const formatBalance = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const getPeriodLabel = () => {
    return t(`balanceCard.period.${period}` as const)
  }

  const isPositive = percentChange > 0
  const isNegative = percentChange < 0

  return (
    <div className="bg-zinc-900/80 backdrop-blur-xl mx-6 mt-6 rounded-3xl p-6 border border-purple-500/30 shadow-[0_12px_24px_rgba(0,0,0,0.5)] max-w-7xl">
      {/* Header with Title and Eye Icon */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-zinc-400 text-[11px] uppercase tracking-wider font-semibold">
          {t("balanceCard.title")}
        </span>
        <button
          onClick={onToggleVisibility}
          className="w-10 h-10 flex items-center justify-center hover:bg-zinc-800/50 rounded-full transition-colors"
          aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
        >
          {isBalanceVisible ? (
            <Eye size={20} className="text-zinc-400" />
          ) : (
            <EyeOff size={20} className="text-zinc-400" />
          )}
        </button>
      </div>

      {/* Balance Amount */}
      <div className="mb-3">
        {isBalanceVisible ? (
          <h2 className="text-white text-4xl font-bold tracking-tight">
            {formatBalance(totalBalance)}
          </h2>
        ) : (
          <h2 className="text-white text-4xl font-bold tracking-tight">
            $ ••••••
          </h2>
        )}
      </div>

      {/* Percent Change Indicator - Always visible */}
      <div className="flex items-center gap-2 bg-zinc-800/50 self-start px-3 py-2 rounded-full">
        {isPositive && <TrendingUp size={16} className="text-green-500" />}
        {isNegative && <TrendingDown size={16} className="text-red-500" />}
        {!isPositive && !isNegative && <TrendingUp size={16} className="text-zinc-400" />}
        <span
          className={`text-sm font-semibold ${
            isPositive
              ? "text-green-500"
              : isNegative
                ? "text-red-500"
                : "text-zinc-400"
          }`}
        >
          {isPositive ? "+" : ""}
          {percentChange.toFixed(1)}%
        </span>
        <span className="text-zinc-500 text-sm">{getPeriodLabel()}</span>
      </div>
    </div>
  )
}
