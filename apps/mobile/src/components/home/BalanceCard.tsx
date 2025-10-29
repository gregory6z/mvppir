import { View, Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { Eye, EyeSlash, TrendUp, TrendDown } from "phosphor-react-native";
import { useTranslation } from "react-i18next";

interface BalanceCardProps {
  totalBalance: number; // USD
  percentChange?: number; // -100 to +100
  period?: "day" | "week" | "month";
  isBalanceVisible: boolean;
  onToggleVisibility: () => void;
}

export function BalanceCard({
  totalBalance,
  percentChange = 0,
  period = "month",
  isBalanceVisible,
  onToggleVisibility,
}: BalanceCardProps) {
  const { t } = useTranslation("home.home");

  const formatBalance = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getPeriodLabel = () => {
    return t(`balanceCard.period.${period}` as const);
  };

  const isPositive = percentChange > 0;
  const isNegative = percentChange < 0;

  const handleToggleVisibility = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleVisibility();
  };

  return (
    <View className="bg-zinc-900 mx-4 mt-4 rounded-3xl p-5 border border-zinc-800 shadow-lg">
      {/* Header with Title and Eye Icon */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
          {t("balanceCard.title")}
        </Text>
        <TouchableOpacity
          onPress={handleToggleVisibility}
          className="w-11 h-11 items-center justify-center -mr-2"
          accessibilityLabel={
            isBalanceVisible ? "Hide balance" : "Show balance"
          }
          accessibilityHint="Double tap to toggle balance visibility"
        >
          {isBalanceVisible ? (
            <Eye size={22} color="#a1a1aa" weight="regular" />
          ) : (
            <EyeSlash size={22} color="#a1a1aa" weight="regular" />
          )}
        </TouchableOpacity>
      </View>

      {/* Balance Amount */}
      <View className="mb-3">
        {isBalanceVisible ? (
          <Text className="text-white text-4xl font-bold tracking-tight">
            {formatBalance(totalBalance)}
          </Text>
        ) : (
          <Text className="text-white text-4xl font-bold tracking-tight">
            $ ••••••
          </Text>
        )}
      </View>

      {/* Percent Change Indicator - More Subtle */}
      {percentChange !== 0 && (
        <View className="flex-row items-center gap-1.5 bg-zinc-800/50 self-start px-3 py-1.5 rounded-full">
          {isPositive && <TrendUp size={14} color="#10b981" weight="bold" />}
          {isNegative && <TrendDown size={14} color="#ef4444" weight="bold" />}
          <Text
            className={`text-xs font-semibold ${
              isPositive
                ? "text-green-500"
                : isNegative
                  ? "text-red-500"
                  : "text-zinc-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {percentChange.toFixed(1)}%
          </Text>
          <Text className="text-zinc-500 text-xs">{getPeriodLabel()}</Text>
        </View>
      )}
    </View>
  );
}
