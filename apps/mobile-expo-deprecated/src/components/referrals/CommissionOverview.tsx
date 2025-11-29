import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Coins, CalendarBlank, TrendUp, Target } from "phosphor-react-native";

interface CommissionOverviewProps {
  today: number; // USD earned today
  thisMonth: number; // USD earned this month
  total: number; // USD total lifetime earnings
  byLevel?: {
    N0: number; // Own balance commissions
    N1: number; // Direct referrals
    N2: number; // Indirect N2
    N3: number; // Indirect N3
  };
}

export function CommissionOverview({
  today,
  thisMonth,
  total,
  byLevel,
}: CommissionOverviewProps) {
  const { t } = useTranslation("referrals.referrals");

  const getLevelColor = (level: string) => {
    switch (level) {
      case "N0":
        return "#8b5cf6"; // Violet - próprio saldo
      case "N1":
        return "#a78bfa"; // Light Violet
      case "N2":
        return "#3b82f6"; // Blue
      case "N3":
        return "#10b981"; // Green
      default:
        return "#71717a"; // Zinc
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "N0":
        return t("commissionOverview.ownBalance");
      case "N1":
        return t("commissionOverview.directReferrals");
      case "N2":
        return t("commissionOverview.indirectN2");
      case "N3":
        return t("commissionOverview.indirectN3");
      default:
        return level;
    }
  };

  return (
    <View className="mx-4 mt-6">
      <Text className="text-white text-base font-semibold mb-4">
        {t("commissionOverview.title")}
      </Text>

      {/* Summary Cards */}
      <View className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 mb-4">
        {/* Today */}
        <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-zinc-800">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-violet-500/20 rounded-xl items-center justify-center">
              <Coins size={20} color="#8b5cf6" weight="duotone" />
            </View>
            <View>
              <Text className="text-zinc-400 text-xs font-medium">{t("commissionOverview.today")}</Text>
              <Text className="text-white text-xl font-bold">
                ${today.toFixed(2)}
              </Text>
            </View>
          </View>
          <View className="bg-violet-500/10 px-3 py-1.5 rounded-full">
            <Text className="text-violet-400 text-xs font-semibold">
              +{((today / Math.max(total, 1)) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* This Month */}
        <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-zinc-800">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-green-500/20 rounded-xl items-center justify-center">
              <CalendarBlank size={20} color="#10b981" weight="duotone" />
            </View>
            <View>
              <Text className="text-zinc-400 text-xs font-medium">
                {t("commissionOverview.thisMonth")}
              </Text>
              <Text className="text-white text-xl font-bold">
                ${thisMonth.toFixed(2)}
              </Text>
            </View>
          </View>
          <View className="bg-green-500/10 px-3 py-1.5 rounded-full">
            <Text className="text-green-400 text-xs font-semibold">
              {new Date().toLocaleDateString("en-US", { month: "short" })}
            </Text>
          </View>
        </View>

        {/* Total Lifetime */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-blue-500/20 rounded-xl items-center justify-center">
              <TrendUp size={20} color="#3b82f6" weight="duotone" />
            </View>
            <View>
              <Text className="text-zinc-400 text-xs font-medium">
                {t("commissionOverview.totalEarned")}
              </Text>
              <Text className="text-white text-xl font-bold">
                ${total.toLocaleString()}
              </Text>
            </View>
          </View>
          <View className="bg-blue-500/10 px-3 py-1.5 rounded-full">
            <Text className="text-blue-400 text-xs font-semibold">
              {t("commissionOverview.allTime")}
            </Text>
          </View>
        </View>
      </View>

      {/* Daily Average */}
      <View className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 p-5 rounded-2xl border border-violet-500/30 mb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-zinc-400 text-xs font-medium mb-1">
              {t("commissionOverview.dailyAverage")}
            </Text>
            <Text className="text-white text-2xl font-bold">
              ${(total / Math.max(new Date().getDate(), 1)).toFixed(2)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-zinc-400 text-xs mb-1">{t("commissionOverview.monthlyEst")}</Text>
            <Text className="text-violet-400 text-lg font-semibold">
              ${((total / Math.max(new Date().getDate(), 1)) * 30).toFixed(0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Commission Breakdown by Level */}
      {byLevel && Object.entries(byLevel).filter(([_, amount]) => amount > 0).length > 0 && (
        <View className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
          <View className="flex-row items-center gap-2 mb-4">
            <Target size={20} color="#8b5cf6" weight="duotone" />
            <Text className="text-white text-base font-semibold">
              {t("commissionOverview.byLevel")}
            </Text>
          </View>

          <View>
            {Object.entries(byLevel)
              .filter(([_, amount]) => typeof amount === 'number' && amount > 0)
              .map(([level, amount], index, filteredArray) => (
                <View
                  key={level}
                  className={`flex-row items-center justify-between py-3 ${
                    index !== filteredArray.length - 1 ? "border-b border-zinc-800" : ""
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="w-8 h-8 rounded-lg items-center justify-center"
                      style={{ backgroundColor: `${getLevelColor(level)}20` }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{ color: getLevelColor(level) }}
                      >
                        {level}
                      </Text>
                    </View>
                    <Text className="text-zinc-300 text-sm">{getLevelLabel(level)}</Text>
                  </View>
                  <Text className="text-white text-base font-semibold">
                    ${(typeof amount === 'number' ? amount : 0).toFixed(2)}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      )}
    </View>
  );
}
