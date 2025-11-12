import { useTranslation } from "react-i18next"
import { Coin, Calendar, TrendUp, Target } from "phosphor-react"

interface CommissionOverviewProps {
  today: number // USD earned today
  thisMonth: number // USD earned this month
  total: number // USD total lifetime earnings
  byLevel?: {
    N0: number // Own balance commissions
    N1: number // Direct referrals
    N2: number // Indirect N2
    N3: number // Indirect N3
  }
}

export function CommissionOverview({
  today,
  thisMonth,
  total,
  byLevel,
}: CommissionOverviewProps) {
  const { t } = useTranslation("referrals.referrals")

  const getLevelColor = (level: string) => {
    switch (level) {
      case "N0":
        return "#8b5cf6" // Violet - próprio saldo
      case "N1":
        return "#a78bfa" // Light Violet
      case "N2":
        return "#3b82f6" // Blue
      case "N3":
        return "#10b981" // Green
      default:
        return "#71717a" // Zinc
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "N0":
        return t("commissionOverview.ownBalance")
      case "N1":
        return t("commissionOverview.directReferrals")
      case "N2":
        return t("commissionOverview.indirectN2")
      case "N3":
        return t("commissionOverview.indirectN3")
      default:
        return level
    }
  }

  return (
    <div className="mx-6 mt-6">
      <p className="text-white text-base font-semibold mb-4">
        {t("commissionOverview.title")}
      </p>

      {/* Summary Cards */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 mb-4">
        {/* Today */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
              <Coin size={20} color="#8b5cf6" weight="duotone" />
            </div>
            <div>
              <span className="text-zinc-400 text-xs font-medium block">
                {t("commissionOverview.today")}
              </span>
              <p className="text-white text-xl font-bold">
                ${today.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="bg-violet-500/10 px-3 py-1.5 rounded-full">
            <span className="text-violet-400 text-xs font-semibold">
              +{((today / Math.max(total, 1)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* This Month */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Calendar size={20} color="#10b981" weight="duotone" />
            </div>
            <div>
              <span className="text-zinc-400 text-xs font-medium block">
                {t("commissionOverview.thisMonth")}
              </span>
              <p className="text-white text-xl font-bold">
                ${thisMonth.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="bg-green-500/10 px-3 py-1.5 rounded-full">
            <span className="text-green-400 text-xs font-semibold">
              {new Date().toLocaleDateString("en-US", { month: "short" })}
            </span>
          </div>
        </div>

        {/* Total Lifetime */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <TrendUp size={20} color="#3b82f6" weight="duotone" />
            </div>
            <div>
              <span className="text-zinc-400 text-xs font-medium block">
                {t("commissionOverview.totalEarned")}
              </span>
              <p className="text-white text-xl font-bold">
                ${total.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-blue-500/10 px-3 py-1.5 rounded-full">
            <span className="text-blue-400 text-xs font-semibold">
              {t("commissionOverview.allTime")}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Average */}
      <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 p-5 rounded-2xl border border-violet-500/30 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-zinc-400 text-xs font-medium block mb-1">
              {t("commissionOverview.dailyAverage")}
            </span>
            <p className="text-white text-2xl font-bold">
              ${(total / Math.max(new Date().getDate(), 1)).toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-zinc-400 text-xs block mb-1">
              {t("commissionOverview.monthlyEst")}
            </span>
            <p className="text-violet-400 text-lg font-semibold">
              ${((total / Math.max(new Date().getDate(), 1)) * 30).toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Commission Breakdown by Level */}
      {byLevel &&
        Object.entries(byLevel).filter(([_, amount]) => amount > 0).length >
          0 && (
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <Target size={20} color="#8b5cf6" weight="duotone" />
              <p className="text-white text-base font-semibold">
                {t("commissionOverview.byLevel")}
              </p>
            </div>

            <div>
              {Object.entries(byLevel)
                .filter(
                  ([_, amount]) => typeof amount === "number" && amount > 0
                )
                .map(([level, amount], index, filteredArray) => (
                  <div
                    key={level}
                    className={`flex items-center justify-between py-3 ${
                      index !== filteredArray.length - 1
                        ? "border-b border-zinc-800"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${getLevelColor(level)}20`,
                        }}
                      >
                        <span
                          className="text-xs font-bold"
                          style={{ color: getLevelColor(level) }}
                        >
                          {level}
                        </span>
                      </div>
                      <span className="text-zinc-300 text-sm">
                        {getLevelLabel(level)}
                      </span>
                    </div>
                    <p className="text-white text-base font-semibold">
                      ${(typeof amount === "number" ? amount : 0).toFixed(2)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
    </div>
  )
}
