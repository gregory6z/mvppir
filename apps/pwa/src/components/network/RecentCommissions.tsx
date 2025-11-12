import { useTranslation } from "react-i18next"
import { Star } from "phosphor-react"
import { formatDistanceToNow } from "date-fns"

type MLMRank = "RECRUIT" | "BRONZE" | "SILVER" | "GOLD"
type CommissionStatus = "PENDING" | "PAID" | "CANCELLED"

interface Commission {
  id: string
  fromUser: {
    name: string
    rank: MLMRank
  }
  level: number // 1, 2, or 3 (N1, N2, N3)
  baseAmount: number // USD
  percentage: number // e.g., 1.05
  finalAmount: number // USD
  referenceDate: string // ISO 8601
  status: CommissionStatus
}

interface RecentCommissionsProps {
  commissions: Commission[]
  maxItems?: number // Default: 10
  onCommissionPress?: (id: string) => void
}

const RANK_EMOJIS: Record<MLMRank, string> = {
  RECRUIT: "🎖️",
  BRONZE: "🥉",
  SILVER: "🥈",
  GOLD: "🥇",
}

export function RecentCommissions({
  commissions,
  maxItems = 10,
  onCommissionPress,
}: RecentCommissionsProps) {
  const { t } = useTranslation("referrals.referrals")
  const limitedCommissions = commissions.slice(0, maxItems)

  const getStatusColor = (status: CommissionStatus) => {
    switch (status) {
      case "PENDING":
        return "text-orange-500"
      case "PAID":
        return "text-green-500"
      case "CANCELLED":
        return "text-red-500"
      default:
        return "text-zinc-400"
    }
  }

  const getStatusLabel = (status: CommissionStatus) => {
    const statusMap = {
      PENDING: "pending",
      PAID: "paid",
      CANCELLED: "cancelled",
    }
    return t(`recentCommissions.status.${statusMap[status]}`)
  }

  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return t("recentCommissions.recently")
    }
  }

  const getLevelLabel = (level: number) => {
    return `N${level}`
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "#8b5cf6" // Violet
      case 2:
        return "#3b82f6" // Blue
      case 3:
        return "#10b981" // Green
      default:
        return "#71717a" // Zinc
    }
  }

  if (limitedCommissions.length === 0) {
    return (
      <div className="mx-6 mt-6">
        <p className="text-white text-base font-semibold mb-3">
          {t("recentCommissions.title")}
        </p>
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 flex flex-col items-center">
          <Star size={48} color="#52525b" weight="duotone" />
          <p className="text-zinc-400 text-center mt-4">
            {t("recentCommissions.empty.title")}
          </p>
          <p className="text-zinc-500 text-sm text-center mt-1">
            {t("recentCommissions.empty.subtitle")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-white text-base font-semibold">
          {t("recentCommissions.title")}
        </p>
        <span className="text-zinc-500 text-sm">
          {limitedCommissions.length} {t("recentCommissions.recent")}
        </span>
      </div>

      {/* Commission List */}
      <div className="space-y-3">
        {limitedCommissions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onCommissionPress?.(item.id)}
            className="w-full bg-zinc-900 p-4 rounded-2xl border border-zinc-800 hover:bg-zinc-800 active:scale-[0.99] transition-all text-left"
            aria-label={`Commission from ${item.fromUser.name}, ${item.finalAmount.toFixed(2)} USD`}
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="w-11 h-11 bg-violet-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Star size={20} color="#8b5cf6" weight="fill" />
              </div>

              {/* Commission Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-[15px]">
                      {item.fromUser.name}
                    </span>
                    <span className="text-base">
                      {RANK_EMOJIS[item.fromUser.rank]}
                    </span>
                  </div>
                  <p className="text-green-500 font-bold text-[15px]">
                    +${item.finalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${getLevelColor(item.level)}20`,
                      }}
                    >
                      <span
                        className="text-xs font-bold"
                        style={{ color: getLevelColor(item.level) }}
                      >
                        {getLevelLabel(item.level)}
                      </span>
                    </div>
                    <span className="text-zinc-400 text-sm">
                      {formatRelativeTime(item.referenceDate)}
                    </span>
                  </div>
                  <div
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor:
                        item.status === "PAID"
                          ? "#10b98120"
                          : item.status === "PENDING"
                            ? "#f59e0b20"
                            : "#ef444420",
                    }}
                  >
                    <span
                      className={`text-xs font-semibold ${getStatusColor(item.status)}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
