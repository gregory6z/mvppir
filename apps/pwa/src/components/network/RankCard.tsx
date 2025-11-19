import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Crown, Sparkle } from "phosphor-react"
import { ChevronRight } from "lucide-react"
import type { MLMRank, RankStatus } from "@/api/mlm/schemas"
import { MLMExplainerDrawer } from "@/components/drawers"

interface RankCardProps {
  currentRank: MLMRank
  rankStatus: RankStatus
  blockedBalance: number // USD
  nextRank?: MLMRank | null // null if already at max rank
  progressToNext?: {
    directs: { current: number; required: number }
    blockedBalance: { current: number; required: number }
    lifetimeVolume: { current: number; required: number }
  } | null
}

const RANK_CONFIG = {
  RECRUIT: {
    emoji: "🎖️",
    color: "#71717a", // Zinc-500
    commissionN1: "0.35%",
  },
  BRONZE: {
    emoji: "🥉",
    color: "#cd7f32", // Bronze color
    commissionN1: "1.05%",
  },
  SILVER: {
    emoji: "🥈",
    color: "#c0c0c0", // Silver color
    commissionN1: "1.80%",
  },
  GOLD: {
    emoji: "🥇",
    color: "#ffd700", // Gold color
    commissionN1: "2.60%",
  },
}

const RANK_STATUS_CONFIG = {
  ACTIVE: {
    color: "#10b981", // Green
    bgColor: "#10b98120",
  },
  WARNING: {
    color: "#f59e0b", // Orange
    bgColor: "#f59e0b20",
  },
  TEMPORARY_DOWNRANK: {
    color: "#ef4444", // Red
    bgColor: "#ef444420",
  },
  DOWNRANKED: {
    color: "#dc2626", // Dark red
    bgColor: "#dc262620",
  },
}

export function RankCard({
  currentRank,
  rankStatus,
  nextRank,
  progressToNext,
}: RankCardProps) {
  const { t } = useTranslation("referrals.referrals")
  const [explainerOpen, setExplainerOpen] = useState(false)
  const rankInfo = RANK_CONFIG[currentRank]
  const statusInfo = RANK_STATUS_CONFIG[rankStatus]

  const getRankLabel = (rank: MLMRank) => {
    return t(`rankCard.ranks.${rank.toLowerCase()}`)
  }

  const getStatusLabel = (status: RankStatus) => {
    const statusMap = {
      ACTIVE: "active",
      WARNING: "warning",
      TEMPORARY_DOWNRANK: "tempDownrank",
      DOWNRANKED: "downranked",
    }
    return t(`rankCard.status.${statusMap[status]}`)
  }

  const calculateProgress = (current: number, required: number) => {
    return Math.min(100, (current / required) * 100)
  }

  return (
    <div className="mx-6 mt-6 bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${rankInfo.color}20` }}
            >
              <span className="text-3xl">{rankInfo.emoji}</span>
            </div>
            <div>
              <p className="text-white text-xl font-bold">
                {getRankLabel(currentRank)}
              </p>
              <p className="text-zinc-400 text-sm">
                {t("rankCard.dailyCommission")}: {rankInfo.commissionN1}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: statusInfo.bgColor }}
          >
            <span
              className="text-xs font-semibold"
              style={{ color: statusInfo.color }}
            >
              {getStatusLabel(rankStatus)}
            </span>
          </div>
        </div>

        {/* How It Works Button */}
        <button
          type="button"
          onClick={() => setExplainerOpen(true)}
          className="flex items-center justify-center gap-2 w-full bg-violet-500/20 px-4 py-2.5 rounded-xl border border-violet-500/30 hover:bg-violet-500/30 transition-colors"
          aria-label="How the ranking system works"
        >
          <Sparkle size={18} color="#8b5cf6" weight="duotone" />
          <span className="text-violet-400 text-sm font-semibold">
            {t("rankCard.howItWorksButton")}
          </span>
          <ChevronRight size={16} className="text-violet-400/70" strokeWidth={2.5} />
        </button>
      </div>

      {/* Progress to Next Rank */}
      {nextRank && progressToNext && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white text-sm font-semibold">
              {t("rankCard.progressTo")} {RANK_CONFIG[nextRank].emoji}{" "}
              {getRankLabel(nextRank)}
            </p>
            <Crown size={18} color="#8b5cf6" weight="duotone" />
          </div>

          {/* Direct Referrals Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-zinc-400 text-xs">
                {t("rankCard.directReferrals")}
              </span>
              <span className="text-violet-400 text-xs font-semibold">
                {progressToNext.directs.current}/{progressToNext.directs.required}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all"
                style={{
                  width: `${calculateProgress(
                    progressToNext.directs.current,
                    progressToNext.directs.required
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Blocked Balance Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-zinc-400 text-xs">
                {t("rankCard.requiredBlocked")}
              </span>
              <span className="text-violet-400 text-xs font-semibold">
                ${progressToNext.blockedBalance.current.toFixed(2)} / $
                {progressToNext.blockedBalance.required.toFixed(2)}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all"
                style={{
                  width: `${calculateProgress(
                    progressToNext.blockedBalance.current,
                    progressToNext.blockedBalance.required
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Lifetime Network Volume Progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-zinc-400 text-xs">
                {t("rankCard.networkVolume")}
              </span>
              <span className="text-violet-400 text-xs font-semibold">
                ${progressToNext.lifetimeVolume.current.toFixed(2)} / $
                {progressToNext.lifetimeVolume.required.toFixed(2)}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all"
                style={{
                  width: `${calculateProgress(
                    progressToNext.lifetimeVolume.current,
                    progressToNext.lifetimeVolume.required
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Max Rank Reached */}
      {!nextRank && (
        <div className="bg-violet-500/10 p-4 rounded-xl border border-violet-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Crown size={20} color="#8b5cf6" weight="fill" />
            <span className="text-violet-400 text-sm font-bold">
              {t("rankCard.maxRankTitle")}
            </span>
          </div>
          <p className="text-zinc-400 text-xs">
            {t("rankCard.maxRankDescription")}
          </p>
        </div>
      )}

      {/* MLM Explainer Drawer */}
      <MLMExplainerDrawer
        open={explainerOpen}
        onOpenChange={setExplainerOpen}
      />
    </div>
  )
}
