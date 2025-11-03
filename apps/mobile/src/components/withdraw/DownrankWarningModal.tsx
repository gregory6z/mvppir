import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { Warning, TrendDown, CurrencyDollar, Lightning, ProhibitInset } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import type { MLMRank } from "@/api/mlm/schemas/mlm.schema";

interface DownrankWarningModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentRank: MLMRank;
  newRank: MLMRank;
  currentBalance: number;
  balanceAfterWithdrawal: number;
  minimumRequired: number;
  currentDailyYield: number;
  newDailyYield: number;
  willBeInactivated?: boolean;
}

const RANK_NAMES: Record<string, string> = {
  RECRUIT: "Recruit",
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
  INACTIVE: "Inactive",
};

const RANK_EMOJIS: Record<string, string> = {
  RECRUIT: "🏅",
  BRONZE: "🥉",
  SILVER: "🥈",
  GOLD: "🥇",
  INACTIVE: "⛔",
};

export function DownrankWarningModal({
  visible,
  onClose,
  onConfirm,
  currentRank,
  newRank,
  currentBalance,
  balanceAfterWithdrawal,
  minimumRequired,
  currentDailyYield,
  newDailyYield,
  willBeInactivated = false,
}: DownrankWarningModalProps) {
  const { t } = useTranslation("withdraw.withdraw");

  // If account will be inactivated, show INACTIVE instead of rank
  const displayNewRank = willBeInactivated ? "INACTIVE" : newRank;
  const displayNewRankName = willBeInactivated ? t("modal.inactive") : RANK_NAMES[newRank];

  const yieldDifference = currentDailyYield - newDailyYield;
  const yieldPercentageLoss = currentDailyYield > 0
    ? ((yieldDifference / currentDailyYield) * 100).toFixed(1)
    : "0";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        <View className="bg-zinc-950 rounded-3xl w-full max-w-md border-2 border-zinc-800/50 shadow-2xl" style={{ maxHeight: '90%' }}>
          {/* Header - Fixed */}
          <View className="px-6 py-5 border-b-2 border-zinc-800/50">
            <Text className="text-white text-xl font-black text-center">
              {t("modal.title")}
            </Text>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ padding: 20 }}
          >
            {/* Rank Change */}
            <View className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-center gap-3 mb-3">
                {/* Current Rank */}
                <View className="items-center">
                  <Text className="text-4xl mb-1">{RANK_EMOJIS[currentRank]}</Text>
                  <Text className="text-white font-semibold text-xs">{RANK_NAMES[currentRank]}</Text>
                </View>

                {/* Arrow */}
                <TrendDown size={28} color={willBeInactivated ? "#ef4444" : "#f59e0b"} weight="fill" />

                {/* New Rank / Inactive */}
                <View className="items-center">
                  <Text className="text-4xl mb-1">{RANK_EMOJIS[displayNewRank]}</Text>
                  <Text className={`${willBeInactivated ? 'text-red-400' : 'text-orange-400'} font-semibold text-xs`}>
                    {displayNewRankName}
                  </Text>
                </View>
              </View>

              <Text className="text-zinc-400 text-xs text-center">
                {t("modal.rankChange", {
                  from: RANK_NAMES[currentRank],
                  to: displayNewRankName,
                })}
              </Text>
            </View>

            {/* Balance Warning */}
            <View className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-4">
              <Text className="text-zinc-400 text-xs uppercase tracking-wide mb-1">{t("modal.balanceAfter")}</Text>
              <Text className="text-white text-2xl font-bold mb-2">
                ${balanceAfterWithdrawal.toFixed(2)}
              </Text>
              <View className="flex-row items-center gap-1">
                <Warning size={14} color="#f87171" weight="fill" />
                <Text className="text-red-400 text-xs font-medium">
                  {t("modal.belowMinimum", { minimum: minimumRequired })}
                </Text>
              </View>
            </View>

            {/* Long-term Impact - ALWAYS SHOW */}
            <View className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-center gap-2 mb-3">
                <CurrencyDollar size={18} color="#a855f7" weight="fill" />
                <Text className="text-purple-400 font-bold text-sm text-center">
                  {t("modal.longTermImpact.title")}
                </Text>
              </View>

              {/* Monthly Loss */}
              <View className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 mb-2">
                <Text className="text-zinc-400 text-xs uppercase tracking-wide mb-1">{t("modal.longTermImpact.monthlyLoss")}</Text>
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-red-400 font-black text-xl">
                    -${((((currentBalance * currentDailyYield) / 100) - ((balanceAfterWithdrawal * newDailyYield) / 100)) * 30).toFixed(2)}
                  </Text>
                  <Text className="text-red-400/70 font-bold text-sm">
                    ({((((((currentBalance * currentDailyYield) / 100) - ((balanceAfterWithdrawal * newDailyYield) / 100)) * 30) / currentBalance) * 100).toFixed(1)}%)
                  </Text>
                </View>
                <Text className="text-zinc-500 text-xs mt-0.5">{t("modal.longTermImpact.perMonth")}</Text>
              </View>

              {/* Annual Loss */}
              <View className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 mb-3">
                <Text className="text-zinc-400 text-xs uppercase tracking-wide mb-1">{t("modal.longTermImpact.annualLoss")}</Text>
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-red-500 font-black text-2xl">
                    -${((((currentBalance * currentDailyYield) / 100) - ((balanceAfterWithdrawal * newDailyYield) / 100)) * 365).toFixed(2)}
                  </Text>
                  <Text className="text-red-500/70 font-bold text-base">
                    ({(((((((currentBalance * currentDailyYield) / 100) - ((balanceAfterWithdrawal * newDailyYield) / 100)) * 30) / currentBalance) * 100) * 12).toFixed(1)}%)
                  </Text>
                </View>
                <Text className="text-zinc-500 text-xs mt-0.5">{t("modal.longTermImpact.perYear")}</Text>
              </View>

              <View className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-2.5">
                <View className="flex-row items-center gap-2">
                  <Lightning size={14} color="#fbbf24" weight="fill" />
                  <Text className="text-yellow-400 text-xs leading-4 font-medium flex-1">
                    {t("modal.longTermImpact.warning")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Inactivation Warning */}
            {willBeInactivated && (
              <View className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 mb-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <ProhibitInset size={16} color="#f87171" weight="fill" />
                  <Text className="text-red-400 font-bold text-sm">
                    {t("modal.inactivationWarning.title")}
                  </Text>
                </View>
                <Text className="text-zinc-400 text-xs leading-5">
                  {t("modal.inactivationWarning.description")}
                </Text>
              </View>
            )}

            {/* Info */}
            <Text className="text-zinc-400 text-xs text-center leading-5">
              {t("modal.confirmMessage")}
            </Text>
          </ScrollView>

          {/* Fixed Actions at Bottom */}
          <View className="px-5 py-4 border-t border-zinc-800/50 gap-2.5 bg-zinc-950">
            <TouchableOpacity
              onPress={onConfirm}
              className="bg-purple-500 rounded-xl py-3.5 active:bg-purple-600"
              accessibilityLabel="Confirm withdrawal"
              accessibilityRole="button"
            >
              <Text className="text-white font-bold text-sm text-center">
                {t("modal.confirmButton")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="bg-zinc-800 rounded-xl py-3.5 active:bg-zinc-700"
              accessibilityLabel="Cancel withdrawal"
              accessibilityRole="button"
            >
              <Text className="text-zinc-300 font-semibold text-sm text-center">
                {t("modal.cancelButton")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
