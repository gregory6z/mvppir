import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { getDateFnsLocale } from "@/lib/utils"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { TrendingUp, TrendingDown, Sparkles, Trophy, AlertCircle } from "lucide-react"
import type { MLMRank } from "@/types/mlm"

interface RankAchievementDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "upgrade" | "downgrade"
  newRank: MLMRank
  previousRank: MLMRank
  changedAt: string
}

const RANK_CONFIG = {
  RECRUIT: {
    emoji: "🎖️",
    color: "#71717a", // Zinc-500
    commission: "0.35%",
  },
  BRONZE: {
    emoji: "🥉",
    color: "#cd7f32", // Bronze color
    commission: "1.05%",
  },
  SILVER: {
    emoji: "🥈",
    color: "#c0c0c0", // Silver color
    commission: "1.80%",
  },
  GOLD: {
    emoji: "🥇",
    color: "#ffd700", // Gold color
    commission: "2.60%",
  },
}

export function RankAchievementDrawer({
  open,
  onOpenChange,
  type,
  newRank,
  previousRank,
  changedAt,
}: RankAchievementDrawerProps) {
  const { t, i18n } = useTranslation("referrals.referrals")
  const locale = getDateFnsLocale(i18n.language)

  const isUpgrade = type === "upgrade"
  const newRankInfo = RANK_CONFIG[newRank]
  const previousRankInfo = RANK_CONFIG[previousRank]

  const getRankLabel = (rank: MLMRank) => {
    return t(`rankCard.ranks.${rank.toLowerCase()}`)
  }

  const formattedDate = format(new Date(changedAt), "PPP", { locale })

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            {/* Icon */}
            <div className="flex justify-center mb-4">
              {isUpgrade ? (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Trophy size={40} className="text-white" strokeWidth={2} />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <AlertCircle size={40} className="text-white" strokeWidth={2} />
                </div>
              )}
            </div>

            {/* Title */}
            <DrawerTitle className="text-center text-2xl font-bold">
              {isUpgrade
                ? t("rankAchievement.upgrade.title")
                : t("rankAchievement.downgrade.title")}
            </DrawerTitle>

            {/* Subtitle */}
            <DrawerDescription className="text-center text-base mt-2">
              {isUpgrade
                ? t("rankAchievement.upgrade.subtitle")
                : t("rankAchievement.downgrade.subtitle")}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-0 space-y-6">
            {/* Rank Change Visual */}
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between">
                {/* Previous Rank */}
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-2">{previousRankInfo.emoji}</span>
                  <span className="text-zinc-400 text-sm font-medium">
                    {getRankLabel(previousRank)}
                  </span>
                </div>

                {/* Arrow */}
                <div className="flex-1 flex justify-center">
                  {isUpgrade ? (
                    <TrendingUp size={32} className="text-green-500" strokeWidth={2.5} />
                  ) : (
                    <TrendingDown size={32} className="text-orange-500" strokeWidth={2.5} />
                  )}
                </div>

                {/* New Rank */}
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-2">{newRankInfo.emoji}</span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: isUpgrade ? "#10b981" : "#f59e0b" }}
                  >
                    {getRankLabel(newRank)}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="text-center mt-4 pt-4 border-t border-zinc-800">
                <span className="text-zinc-500 text-xs">
                  {isUpgrade
                    ? t("rankAchievement.upgrade.achievedOn")
                    : t("rankAchievement.downgrade.downgraded")}
                  :{" "}
                </span>
                <span className="text-zinc-400 text-xs font-medium">{formattedDate}</span>
              </div>
            </div>

            {/* Benefits/New Limits */}
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles
                  size={20}
                  className={isUpgrade ? "text-green-500" : "text-orange-500"}
                />
                <h3 className="text-white text-sm font-bold">
                  {isUpgrade
                    ? t("rankAchievement.upgrade.benefits.title")
                    : t("rankAchievement.downgrade.newLimits.title")}
                </h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-3xl font-bold"
                  style={{ color: isUpgrade ? "#10b981" : "#f59e0b" }}
                >
                  {newRankInfo.commission}
                </span>
                <span className="text-zinc-400 text-sm">
                  {isUpgrade
                    ? t("rankAchievement.upgrade.benefits.perDay")
                    : t("rankAchievement.downgrade.newLimits.perDay")}
                </span>
              </div>
            </div>

            {/* Upgrade - Next Steps / Downgrade - Reason & Recovery */}
            {isUpgrade ? (
              <div className="bg-violet-500/10 p-5 rounded-2xl border border-violet-500/30">
                <h3 className="text-violet-400 text-sm font-bold mb-3">
                  {t("rankAchievement.upgrade.nextSteps.title")}
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <span className="text-zinc-300 text-sm leading-relaxed">
                      {t("rankAchievement.upgrade.nextSteps.maintain")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <span className="text-zinc-300 text-sm leading-relaxed">
                      {t("rankAchievement.upgrade.nextSteps.grow")}
                    </span>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                {/* Reason */}
                <div className="bg-orange-500/10 p-5 rounded-2xl border border-orange-500/30">
                  <h3 className="text-orange-400 text-sm font-bold mb-2">
                    {t("rankAchievement.downgrade.reason.title")}
                  </h3>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {t("rankAchievement.downgrade.reason.missedRequirements")}
                  </p>
                </div>

                {/* Recovery */}
                <div className="bg-blue-500/10 p-5 rounded-2xl border border-blue-500/30">
                  <h3 className="text-blue-400 text-sm font-bold mb-3">
                    {t("rankAchievement.downgrade.recovery.title")}
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span className="text-zinc-300 text-sm leading-relaxed">
                        {t("rankAchievement.downgrade.recovery.rebuild")}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span className="text-zinc-300 text-sm leading-relaxed">
                        {t("rankAchievement.downgrade.recovery.maintain")}
                      </span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <button
                className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${
                  isUpgrade
                    ? "bg-green-500 hover:bg-green-600 active:bg-green-700"
                    : "bg-orange-500 hover:bg-orange-600 active:bg-orange-700"
                }`}
              >
                {isUpgrade
                  ? t("rankAchievement.upgrade.closeButton")
                  : t("rankAchievement.downgrade.closeButton")}
              </button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
