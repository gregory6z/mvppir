import { ArrowDown, ArrowUp, Star } from "lucide-react"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"
import type { UnifiedTransaction } from "@/api/user/schemas"

interface TransactionItemProps {
  transaction: UnifiedTransaction
  isBalanceVisible: boolean
  onPress: () => void
}

export function TransactionItem({
  transaction,
  isBalanceVisible,
  onPress,
}: TransactionItemProps) {
  const { t } = useTranslation("home.home")

  const isDeposit = transaction.type === "DEPOSIT"
  const isWithdrawal = transaction.type === "WITHDRAWAL"
  const isCommission = transaction.type === "COMMISSION"
  const isDailyCommission = isCommission && transaction.commissionLevel === 0

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
      iconColor = "text-yellow-500"
      iconBgColor = "bg-yellow-500/10"
      amountColor = "text-green-500"
    } else {
      iconColor = "text-purple-500"
      iconBgColor = "bg-purple-500/10"
      amountColor = "text-green-500"
    }
  }

  const formatAmount = (amount: string, type: UnifiedTransaction["type"]) => {
    const sign = type === "DEPOSIT" || type === "COMMISSION" ? "+" : "-"
    return `${sign}$${parseFloat(amount).toFixed(2)}`
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm")
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "text-purple-500 bg-purple-500/20"
      case 2:
        return "text-blue-500 bg-blue-500/20"
      case 3:
        return "text-green-500 bg-green-500/20"
      default:
        return "text-zinc-400 bg-zinc-500/20"
    }
  }

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

  const getRankLabel = (rank?: string) => {
    if (!rank) return ""
    const rankKey = rank.toLowerCase() as "recruit" | "bronze" | "silver" | "gold"
    return t(`recentActivity.rankLabels.${rankKey}`)
  }

  const transactionLabel = isDeposit
    ? t("recentActivity.types.deposit")
    : isWithdrawal
      ? t("recentActivity.types.withdrawal")
      : isDailyCommission
        ? transaction.userRank
          ? `${getRankLabel(transaction.userRank)} ${t("recentActivity.types.dailyCommission")}`
          : t("recentActivity.types.dailyCommission")
        : t("recentActivity.types.commission")

  return (
    <button
      onClick={onPress}
      className="w-full bg-zinc-900 mb-3 p-4 rounded-2xl border border-zinc-800 hover:bg-zinc-800 active:scale-[0.99] transition-all text-left"
      aria-label={`${transaction.type} transaction, ${formatAmount(transaction.amount, transaction.type)}`}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgColor}`}>
          <Icon
            size={22}
            className={iconColor}
            strokeWidth={isCommission ? 0 : 2.5}
            fill={isCommission ? "currentColor" : "none"}
          />
        </div>

        {/* Transaction Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-white font-semibold text-base truncate">
                {transactionLabel}
              </span>
              {/* Commission Level Badge */}
              {isCommission && typeof transaction.commissionLevel === 'number' && transaction.commissionLevel > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getLevelColor(transaction.commissionLevel)}`}>
                  N{transaction.commissionLevel}
                </span>
              )}
            </div>
            <span className={`font-bold text-base ${amountColor} whitespace-nowrap ml-2`}>
              {isBalanceVisible ? formatAmount(transaction.amount, transaction.type) : "$ ••••"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-zinc-400 text-sm">
                {formatTime(transaction.createdAt)}
              </span>
              {isCommission && transaction.fromUserName && (
                <span className="text-zinc-400 text-sm truncate">
                  • {t("recentActivity.commissionFrom")} {transaction.fromUserName}
                </span>
              )}
              {isDailyCommission && (
                <span className="text-zinc-400 text-sm truncate">
                  • {t("recentActivity.selfCommission")}
                </span>
              )}
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                transaction.status === "PENDING"
                  ? "bg-orange-500/10"
                  : transaction.status === "CONFIRMED" || transaction.status === "PAID"
                    ? "bg-green-500/10"
                    : "bg-purple-500/10"
              } ${getStatusColor(transaction.status)}`}
            >
              {getStatusLabel(transaction.status)}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
