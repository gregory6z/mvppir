/**
 * Daily Commission Modal
 *
 * Modal displayed when user opens app after receiving daily commission.
 * Shows total commission, rank, and breakdown by level (N0, N1, N2, N3).
 */

import { View, Text, Modal, Pressable, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { getDateFnsLocale } from "@/lib/utils";

interface CommissionBreakdown {
  level: number; // 0, 1, 2, 3
  levelName: string; // "N0", "N1", "N2", "N3"
  amount: number;
  percentage: number;
  count: number; // Number of network users at this level
}

interface DailyCommissionModalProps {
  visible: boolean;
  onClose: () => void;
  totalAmount: number;
  tokenSymbol: string;
  rank: "RECRUIT" | "BRONZE" | "SILVER" | "GOLD";
  breakdown?: CommissionBreakdown[];
  date: string; // ISO date string
}

const RANK_COLORS: Record<string, string> = {
  RECRUIT: "text-zinc-400",
  BRONZE: "text-orange-500",
  SILVER: "text-gray-300",
  GOLD: "text-yellow-400",
};

export function DailyCommissionModal({
  visible,
  onClose,
  totalAmount,
  tokenSymbol,
  rank,
  breakdown = [],
  date,
}: DailyCommissionModalProps) {
  const { t, i18n } = useTranslation("home.dailyCommissionModal");

  const locale = getDateFnsLocale(i18n.language);
  const formattedDate = format(new Date(date), "d 'de' MMMM, yyyy", { locale });

  const getRankLabel = (rankKey: string) => {
    return t(`ranks.${rankKey.toLowerCase()}`);
  };

  const getLevelLabel = (level: number) => {
    return t(`levels.level${level}`);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/80 items-center justify-center px-6">
        <View className="bg-zinc-900 rounded-2xl w-full max-w-md border border-zinc-800 overflow-hidden">
          {/* Header */}
          <View className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 items-center">
            <Text className="text-4xl mb-2">💰</Text>
            <Text className="text-white text-2xl font-bold text-center">
              {t("title")}
            </Text>
            <Text className="text-white/80 text-sm mt-1">{formattedDate}</Text>
          </View>

          {/* Total Amount */}
          <View className="p-6 items-center border-b border-zinc-800">
            <Text className="text-zinc-400 text-sm mb-1">{t("youReceived")}</Text>
            <Text className="text-white text-4xl font-bold">
              {totalAmount.toFixed(2)} <Text className="text-2xl">{tokenSymbol}</Text>
            </Text>
            <View className="flex-row items-center gap-2 mt-3">
              <View className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <Text className={`text-sm font-semibold ${RANK_COLORS[rank]}`}>
                {t("rank")}: {getRankLabel(rank)}
              </Text>
            </View>
          </View>

          {/* Breakdown */}
          {breakdown.length > 0 && (
            <ScrollView className="max-h-64 px-6 py-4">
              <Text className="text-zinc-400 text-xs font-semibold uppercase mb-3">
                {t("breakdown")}
              </Text>

              {breakdown.map((item) => (
                <View
                  key={item.level}
                  className="flex-row items-center justify-between py-3 border-b border-zinc-800/50"
                >
                  <View className="flex-1">
                    <Text className="text-white text-sm font-medium">
                      {getLevelLabel(item.level)}
                    </Text>
                    <Text className="text-zinc-500 text-xs mt-0.5">
                      {item.percentage}% · {item.count} {t("people", { count: item.count })}
                    </Text>
                  </View>
                  <Text className="text-green-500 text-sm font-bold">
                    +{item.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Footer */}
          <View className="p-6 pt-4">
            <Pressable
              onPress={onClose}
              className="bg-blue-600 active:bg-blue-700 rounded-xl py-4 items-center"
            >
              <Text className="text-white text-base font-semibold">{t("close")}</Text>
            </Pressable>

            <Text className="text-zinc-500 text-xs text-center mt-4">
              {t("credited")}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
