import { useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { useTranslation } from "react-i18next"
import { Crown, LockKey, Sparkle } from "phosphor-react-native"
import type { MLMRank, RankStatus } from "@/api/mlm/schemas/mlm.schema"
import { MLMExplainerModal } from "./MLMExplainerModal"

interface RankCardProps {
  currentRank: MLMRank;
  rankStatus: RankStatus;
  blockedBalance: number; // USD
  lifetimeVolume: number; // USD - Network volume (user + N1+N2+N3)
  nextRank?: MLMRank | null; // null if already at max rank
  progressToNext?: {
    directs: { current: number; required: number };
    blockedBalance: { current: number; required: number };
    lifetimeVolume: { current: number; required: number };
  } | null;
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
};

const RANK_STATUS_CONFIG = {
  ACTIVE: {
    color: "#10b981", // Green
    bgColor: "#10b981/10",
  },
  WARNING: {
    color: "#f59e0b", // Orange
    bgColor: "#f59e0b/10",
  },
  TEMPORARY_DOWNRANK: {
    color: "#ef4444", // Red
    bgColor: "#ef4444/10",
  },
  DOWNRANKED: {
    color: "#dc2626", // Dark red
    bgColor: "#dc2626/10",
  },
};

export function RankCard({
  currentRank,
  rankStatus,
  blockedBalance,
  lifetimeVolume,
  nextRank,
  progressToNext,
}: RankCardProps) {
  const { t } = useTranslation("referrals.referrals")
  const [showExplainer, setShowExplainer] = useState(false)
  const rankInfo = RANK_CONFIG[currentRank];
  const statusInfo = RANK_STATUS_CONFIG[rankStatus];

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
    return Math.min(100, (current / required) * 100);
  };

  return (
    <View className="mx-4 mt-6 bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
      {/* Header */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-3">
            <View
              className="w-14 h-14 rounded-2xl items-center justify-center"
              style={{ backgroundColor: `${rankInfo.color}20` }}
            >
              <Text className="text-3xl">{rankInfo.emoji}</Text>
            </View>
            <View>
              <Text className="text-white text-xl font-bold">
                {getRankLabel(currentRank)}
              </Text>
              <Text className="text-zinc-400 text-sm">
                {t("rankCard.dailyCommission")}: {rankInfo.commissionN1}
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View
            className="px-3 py-1.5 rounded-full"
            style={{
              backgroundColor:
                rankStatus === "ACTIVE"
                  ? "#10b98120"
                  : rankStatus === "WARNING"
                    ? "#f59e0b20"
                    : "#ef444420",
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: statusInfo.color }}
            >
              {getStatusLabel(rankStatus)}
            </Text>
          </View>
        </View>

        {/* How It Works Button */}
        <TouchableOpacity
          onPress={() => setShowExplainer(true)}
          className="flex-row items-center justify-center gap-2 bg-violet-500/20 px-4 py-2.5 rounded-xl border border-violet-500/30 active:bg-violet-500/30"
          accessibilityLabel="How the ranking system works"
        >
          <Sparkle size={18} color="#8b5cf6" weight="duotone" />
          <Text className="text-violet-400 text-sm font-semibold">
            {t("rankCard.howItWorksButton")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Blocked Balance */}
      <View className="bg-zinc-800/50 p-4 rounded-xl mb-6">
        <View className="flex-row items-center gap-2 mb-1">
          <LockKey size={16} color="#8b5cf6" weight="duotone" />
          <Text className="text-zinc-400 text-xs font-medium">
            {t("rankCard.blockedBalance")}
          </Text>
        </View>
        <Text className="text-white text-2xl font-bold">
          ${blockedBalance.toFixed(2)}
        </Text>
      </View>

      {/* Progress to Next Rank */}
      {nextRank && progressToNext && (
        <View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-sm font-semibold">
              {t("rankCard.progressTo")} {RANK_CONFIG[nextRank].emoji}{" "}
              {getRankLabel(nextRank)}
            </Text>
            <Crown size={18} color="#8b5cf6" weight="duotone" />
          </View>

          {/* Direct Referrals Progress */}
          <View className="mb-3">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-zinc-400 text-xs">{t("rankCard.directReferrals")}</Text>
              <Text className="text-violet-400 text-xs font-semibold">
                {progressToNext.directs.current}/{progressToNext.directs.required}
              </Text>
            </View>
            <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <View
                className="h-full bg-violet-500 rounded-full"
                style={{
                  width: `${calculateProgress(
                    progressToNext.directs.current,
                    progressToNext.directs.required
                  )}%`,
                }}
              />
            </View>
          </View>

          {/* Blocked Balance Progress */}
          <View className="mb-3">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-zinc-400 text-xs">{t("rankCard.requiredBlocked")}</Text>
              <Text className="text-violet-400 text-xs font-semibold">
                ${progressToNext.blockedBalance.current.toFixed(2)} / $
                {progressToNext.blockedBalance.required.toFixed(2)}
              </Text>
            </View>
            <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <View
                className="h-full bg-violet-500 rounded-full"
                style={{
                  width: `${calculateProgress(
                    progressToNext.blockedBalance.current,
                    progressToNext.blockedBalance.required
                  )}%`,
                }}
              />
            </View>
          </View>

          {/* Lifetime Network Volume Progress */}
          <View>
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-zinc-400 text-xs">{t("rankCard.networkVolume")}</Text>
              <Text className="text-violet-400 text-xs font-semibold">
                ${progressToNext.lifetimeVolume.current.toFixed(2)} / $
                {progressToNext.lifetimeVolume.required.toFixed(2)}
              </Text>
            </View>
            <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <View
                className="h-full bg-violet-500 rounded-full"
                style={{
                  width: `${calculateProgress(
                    progressToNext.lifetimeVolume.current,
                    progressToNext.lifetimeVolume.required
                  )}%`,
                }}
              />
            </View>
          </View>
        </View>
      )}

      {/* Max Rank Reached */}
      {!nextRank && (
        <View className="bg-violet-500/10 p-4 rounded-xl border border-violet-500/30">
          <View className="flex-row items-center gap-2 mb-1">
            <Crown size={20} color="#8b5cf6" weight="fill" />
            <Text className="text-violet-400 text-sm font-bold">
              {t("rankCard.maxRankTitle")}
            </Text>
          </View>
          <Text className="text-zinc-400 text-xs">
            {t("rankCard.maxRankDescription")}
          </Text>
        </View>
      )}

      {/* MLM Explainer Modal */}
      <MLMExplainerModal
        visible={showExplainer}
        onClose={() => setShowExplainer(false)}
      />
    </View>
  );
}
