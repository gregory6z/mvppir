import { useTranslation } from "react-i18next"
import { Users, User, TrendUp, Calendar } from "phosphor-react"
import type { MLMRank } from "@/api/mlm/schemas"

interface NetworkStatsProps {
  totalDirects: number // Lifetime count
  activeDirects: number // Active this month
  monthlyVolume: number // Monthly network volume (USD)
  currentRank: MLMRank
}

export function NetworkStats({
  totalDirects,
  activeDirects,
  monthlyVolume,
  currentRank,
}: NetworkStatsProps) {
  const { t } = useTranslation("referrals.referrals")

  const formatNumber = (num: number) => {
    const value = typeof num === "number" && !isNaN(num) ? num : 0
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  return (
    <div className="mx-6 mt-6">
      {/* Title */}
      <p className="text-white text-base font-semibold mb-3">
        {t("networkStats.title")}
      </p>

      {/* Monthly Maintenance Info Button */}
      <button
        type="button"
        className="flex items-center justify-center gap-2 w-full bg-orange-500/20 px-4 py-2.5 rounded-xl border border-orange-500/30 hover:bg-orange-500/30 transition-colors mb-4"
        aria-label="Monthly maintenance requirements"
      >
        <Calendar size={18} color="#f59e0b" weight="duotone" />
        <span className="text-orange-400 text-sm font-semibold">
          {t("explainer.maintenance.title")}
        </span>
      </button>

      {/* Summary Cards */}
      <div className="space-y-3 mb-4">
        {/* Top Row - 2 Cards */}
        <div className="flex gap-3">
          {/* Total Directs */}
          <div className="flex-1 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <Users size={18} color="#8b5cf6" weight="bold" />
              </div>
              <span className="text-zinc-400 text-xs font-medium">
                {t("networkStats.totalDirects")}
              </span>
            </div>
            <p className="text-white text-2xl font-bold">{totalDirects}</p>
            <p className="text-zinc-500 text-xs mt-1">
              {t("networkStats.lifetime")}
            </p>
          </div>

          {/* Active Directs */}
          <div className="flex-1 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <User size={18} color="#10b981" weight="bold" />
              </div>
              <span className="text-zinc-400 text-xs font-medium">
                {t("networkStats.activeNow")}
              </span>
            </div>
            <p className="text-white text-2xl font-bold">{activeDirects}</p>
            <p className="text-zinc-500 text-xs mt-1">
              {t("networkStats.thisMonth")}
            </p>
          </div>
        </div>

        {/* Network Volume - Full Width Card */}
        <div className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 p-4 rounded-2xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <TrendUp size={22} color="#3b82f6" weight="bold" />
              </div>
              <div>
                <span className="text-zinc-400 text-xs font-medium block mb-1">
                  {t("networkStats.networkVolume")}
                </span>
                <p className="text-white text-2xl font-bold">
                  {formatNumber(monthlyVolume)}
                </p>
              </div>
            </div>
            <div className="bg-blue-500/10 px-3 py-1.5 rounded-full">
              <span className="text-blue-400 text-xs font-semibold">
                {t("networkStats.thisMonth")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
