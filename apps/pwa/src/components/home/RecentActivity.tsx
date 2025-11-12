import { ArrowDown, ArrowUp, Star, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useTranslation } from "react-i18next"
import type { UnifiedTransaction } from "@/api/user/schemas"

interface RecentActivityProps {
  transactions: UnifiedTransaction[]
  maxItems?: number
  onViewAll: () => void
  onTransactionPress?: (id: string) => void
  isBalanceVisible?: boolean
}

export function RecentActivity({
  transactions,
  maxItems = 4,
  onViewAll,
  onTransactionPress,
  isBalanceVisible = true,
}: RecentActivityProps) {
  const { t } = useTranslation("home.home")
  const limitedTransactions = transactions.slice(0, maxItems)

  const getStatusColor = (status: UnifiedTransaction["status"]) => {
    switch (status) {
      case "PENDING":
        return "text-orange-500"
      case "CONFIRMED":
        return "text-green-500"
      case "SENT_TO_GLOBAL":
        return "text-purple-500"
      case "PAID":
        return "text-green-500"
      case "CANCELLED":
        return "text-red-500"
      default:
        return "text-zinc-400"
    }
  }

  const getStatusLabel = (status: UnifiedTransaction["status"]) => {
    switch (status) {
      case "PENDING":
        return t("recentActivity.status.pending")
      case "CONFIRMED":
        return t("recentActivity.status.confirmed")
      case "SENT_TO_GLOBAL":
        return t("recentActivity.status.completed")
      case "PAID":
        return t("recentActivity.status.confirmed")
      case "CANCELLED":
        return t("recentActivity.status.cancelled")
      default:
        return status
    }
  }

  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return "Recently"
    }
  }

  const formatAmount = (amount: string, type: UnifiedTransaction["type"]) => {
    const sign = type === "DEPOSIT" || type === "COMMISSION" ? "+" : "-"
    return `${sign}$${parseFloat(amount).toFixed(2)}`
  }

  if (limitedTransactions.length === 0) {
    return (
      <div className="mx-6 mt-6 max-w-7xl">
        <h2 className="text-white text-base font-semibold mb-4">
          {t("recentActivity.title")}
        </h2>
        <div className="bg-zinc-900/80 backdrop-blur-xl p-6 rounded-2xl border border-zinc-800 text-center">
          <Star size={40} className="text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">
            {t("recentActivity.empty.title")}
          </p>
          <p className="text-zinc-500 text-xs mt-1">
            {t("recentActivity.empty.subtitle")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-6 mt-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-base font-semibold">
          {t("recentActivity.title")}
        </h2>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity py-1"
          aria-label="View all transactions"
        >
          <span className="text-purple-500 text-sm font-medium">
            {t("recentActivity.viewAll")}
          </span>
          <ArrowRight size={14} className="text-purple-500" />
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {limitedTransactions.map((item) => {
          const isDeposit = item.type === "DEPOSIT"
          const isWithdrawal = item.type === "WITHDRAWAL"
          const isCommission = item.type === "COMMISSION"
          const isDailyCommission = isCommission && item.commissionLevel === 0

          let Icon = ArrowDown
          let iconColor = "text-green-500"
          let iconBgColor = "bg-green-500/10"
          let amountColor = "text-green-500"

          if (isWithdrawal) {
            Icon = ArrowUp
            iconColor = "text-red-500"
            iconBgColor = "bg-red-500/10"
            amountColor = "text-red-500"
          } else if (isCommission) {
            Icon = Star
            if (isDailyCommission) {
              // N0 - Daily Commission (Yellow)
              iconColor = "text-yellow-500"
              iconBgColor = "bg-yellow-500/10"
              amountColor = "text-green-500"
            } else {
              // N1, N2, N3 - Network Commission (Purple)
              iconColor = "text-purple-500"
              iconBgColor = "bg-purple-500/10"
              amountColor = "text-green-500"
            }
          }

          const transactionLabel = isDeposit
            ? t("recentActivity.types.deposit")
            : isWithdrawal
              ? t("recentActivity.types.withdrawal")
              : isDailyCommission
                ? t("recentActivity.types.dailyCommission")
                : t("recentActivity.types.commission")

          return (
            <button
              key={item.id}
              onClick={() => onTransactionPress?.(item.id)}
              className="w-full bg-zinc-900/80 backdrop-blur-xl p-4 rounded-2xl border border-zinc-800 hover:bg-zinc-800 active:scale-[0.99] transition-all text-left"
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgColor}`}>
                  <Icon
                    size={18}
                    className={iconColor}
                    strokeWidth={isCommission ? 0 : 2.5}
                    fill={isCommission ? "currentColor" : "none"}
                  />
                </div>

                {/* Transaction Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">
                        {transactionLabel}
                      </span>
                      {/* Commission Level Badge */}
                      {isCommission && typeof item.commissionLevel === 'number' && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          item.commissionLevel === 0
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-purple-500/20 text-purple-500"
                        }`}>
                          N{item.commissionLevel}
                        </span>
                      )}
                    </div>
                    <span className={`font-bold text-sm ${amountColor} whitespace-nowrap ml-2`}>
                      {isBalanceVisible ? formatAmount(item.amount, item.type) : "$ ••••••"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-400 text-xs truncate">
                      {isCommission && item.fromUserName
                        ? `${t("recentActivity.commissionFrom")} ${item.fromUserName}`
                        : formatRelativeTime(item.createdAt)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                        item.status === "PENDING"
                          ? "bg-orange-500/10"
                          : item.status === "CONFIRMED"
                            ? "bg-green-500/10"
                            : "bg-purple-500/10"
                      } ${getStatusColor(item.status)}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
