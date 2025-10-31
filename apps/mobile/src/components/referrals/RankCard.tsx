import { View, Text } from "react-native"
import { Crown, LockKey } from "phosphor-react-native"
import type { MLMRank, RankStatus } from "@/api/mlm/schemas/mlm.schema"

interface RankCardProps {
  currentRank: MLMRank;
  rankStatus: RankStatus;
  blockedBalance: number; // USD
  nextRank?: MLMRank | null; // null if already at max rank
  progressToNext?: {
    directs: { current: number; required: number };
    blockedBalance: { current: number; required: number };
  } | null;
}

const RANK_CONFIG = {
  RECRUIT: {
    label: "Recruit",
    emoji: "🎖️",
    color: "#71717a", // Zinc-500
    commissionN1: "0.35%",
  },
  BRONZE: {
    label: "Bronze",
    emoji: "🥉",
    color: "#cd7f32", // Bronze color
    commissionN1: "1.05%",
  },
  SILVER: {
    label: "Silver",
    emoji: "🥈",
    color: "#c0c0c0", // Silver color
    commissionN1: "1.80%",
  },
  GOLD: {
    label: "Gold",
    emoji: "🥇",
    color: "#ffd700", // Gold color
    commissionN1: "2.60%",
  },
};

const RANK_STATUS_CONFIG = {
  ACTIVE: {
    label: "Active",
    color: "#10b981", // Green
    bgColor: "#10b981/10",
  },
  WARNING: {
    label: "Warning",
    color: "#f59e0b", // Orange
    bgColor: "#f59e0b/10",
  },
  TEMPORARY_DOWNRANK: {
    label: "Temp Downrank",
    color: "#ef4444", // Red
    bgColor: "#ef4444/10",
  },
  DOWNRANKED: {
    label: "Downranked",
    color: "#dc2626", // Dark red
    bgColor: "#dc2626/10",
  },
};

export function RankCard({
  currentRank,
  rankStatus,
  blockedBalance,
  nextRank,
  progressToNext,
}: RankCardProps) {
  const rankInfo = RANK_CONFIG[currentRank];
  const statusInfo = RANK_STATUS_CONFIG[rankStatus];

  const calculateProgress = (current: number, required: number) => {
    return Math.min(100, (current / required) * 100);
  };

  return (
    <View className="mx-4 mt-4 bg-zinc-900 rounded-3xl p-5 border border-zinc-800">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View
            className="w-14 h-14 rounded-2xl items-center justify-center"
            style={{ backgroundColor: `${rankInfo.color}20` }}
          >
            <Text className="text-3xl">{rankInfo.emoji}</Text>
          </View>
          <View>
            <Text className="text-white text-xl font-bold">
              {rankInfo.label}
            </Text>
            <Text className="text-zinc-400 text-sm">
              Daily Commission: {rankInfo.commissionN1}
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
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* Blocked Balance */}
      <View className="bg-zinc-800/50 p-3 rounded-xl mb-4">
        <View className="flex-row items-center gap-2 mb-1">
          <LockKey size={16} color="#8b5cf6" weight="duotone" />
          <Text className="text-zinc-400 text-xs font-medium">
            Blocked Balance
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
              Progress to {RANK_CONFIG[nextRank].emoji}{" "}
              {RANK_CONFIG[nextRank].label}
            </Text>
            <Crown size={18} color="#8b5cf6" weight="duotone" />
          </View>

          {/* Direct Referrals Progress */}
          <View className="mb-3">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-zinc-400 text-xs">Direct Referrals</Text>
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
          <View>
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-zinc-400 text-xs">Required Blocked</Text>
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
        </View>
      )}

      {/* Max Rank Reached */}
      {!nextRank && (
        <View className="bg-violet-500/10 p-4 rounded-xl border border-violet-500/30">
          <View className="flex-row items-center gap-2 mb-1">
            <Crown size={20} color="#8b5cf6" weight="fill" />
            <Text className="text-violet-400 text-sm font-bold">
              Maximum Rank Achieved!
            </Text>
          </View>
          <Text className="text-zinc-400 text-xs">
            You've reached the highest rank in the system
          </Text>
        </View>
      )}
    </View>
  );
}
