import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Users, UserCheck, CalendarCheck, TrendUp } from "phosphor-react-native";
import { MonthlyMaintenanceModal } from "./MonthlyMaintenanceModal";
import type { MLMRank } from "@/api/mlm/schemas/mlm.schema";

interface NetworkStatsProps {
  totalDirects: number; // Lifetime count
  activeDirects: number; // Active this month
  monthlyVolume: number; // Monthly network volume (USD)
  currentRank: MLMRank;
}

export function NetworkStats({
  totalDirects,
  activeDirects,
  monthlyVolume,
  currentRank,
}: NetworkStatsProps) {
  const { t } = useTranslation("referrals.referrals");
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const formatNumber = (num: number) => {
    const value = typeof num === 'number' && !isNaN(num) ? num : 0;
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <View className="mx-4 mt-6">
      {/* Title */}
      <Text className="text-white text-base font-semibold mb-3">
        {t("networkStats.title")}
      </Text>

      {/* Monthly Maintenance Info Button */}
      <TouchableOpacity
        onPress={() => setShowMaintenanceModal(true)}
        className="flex-row items-center justify-center gap-2 bg-orange-500/20 px-4 py-2.5 rounded-xl border border-orange-500/30 active:bg-orange-500/30 mb-4"
        accessibilityLabel="Monthly maintenance requirements"
      >
        <CalendarCheck size={18} color="#f59e0b" weight="duotone" />
        <Text className="text-orange-400 text-sm font-semibold">
          {t("explainer.maintenance.title")}
        </Text>
      </TouchableOpacity>

      {/* Summary Cards */}
      <View className="gap-3 mb-4">
        {/* Top Row - 2 Cards */}
        <View className="flex-row gap-3">
          {/* Total Directs */}
          <View className="flex-1 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-8 h-8 bg-violet-500/20 rounded-lg items-center justify-center">
                <Users size={18} color="#8b5cf6" weight="bold" />
              </View>
              <Text className="text-zinc-400 text-xs font-medium">
                {t("networkStats.totalDirects")}
              </Text>
            </View>
            <Text className="text-white text-2xl font-bold">{totalDirects}</Text>
            <Text className="text-zinc-500 text-xs mt-1">{t("networkStats.lifetime")}</Text>
          </View>

          {/* Active Directs */}
          <View className="flex-1 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-8 h-8 bg-green-500/20 rounded-lg items-center justify-center">
                <UserCheck size={18} color="#10b981" weight="bold" />
              </View>
              <Text className="text-zinc-400 text-xs font-medium">
                {t("networkStats.activeNow")}
              </Text>
            </View>
            <Text className="text-white text-2xl font-bold">{activeDirects}</Text>
            <Text className="text-zinc-500 text-xs mt-1">{t("networkStats.thisMonth")}</Text>
          </View>
        </View>

        {/* Network Volume - Full Width Card */}
        <View className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 p-4 rounded-2xl border border-blue-500/30">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-blue-500/20 rounded-xl items-center justify-center">
                <TrendUp size={22} color="#3b82f6" weight="bold" />
              </View>
              <View>
                <Text className="text-zinc-400 text-xs font-medium mb-1">
                  {t("networkStats.networkVolume")}
                </Text>
                <Text className="text-white text-2xl font-bold">
                  {formatNumber(monthlyVolume)}
                </Text>
              </View>
            </View>
            <View className="bg-blue-500/10 px-3 py-1.5 rounded-full">
              <Text className="text-blue-400 text-xs font-semibold">
                {t("networkStats.thisMonth")}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Monthly Maintenance Modal */}
      <MonthlyMaintenanceModal
        visible={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        currentRank={currentRank}
      />
    </View>
  );
}
