import { View, Text } from "react-native";
import { Coins, CalendarBlank, TrendUp } from "phosphor-react-native";

interface CommissionOverviewProps {
  today: number; // USD earned today
  thisMonth: number; // USD earned this month
  total: number; // USD total lifetime earnings
}

export function CommissionOverview({
  today,
  thisMonth,
  total,
}: CommissionOverviewProps) {
  return (
    <View className="mx-4 mt-4">
      <Text className="text-white text-base font-semibold mb-3">
        Commission Earnings
      </Text>

      {/* Summary Cards */}
      <View className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3">
        {/* Today */}
        <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-zinc-800">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-violet-500/20 rounded-xl items-center justify-center">
              <Coins size={20} color="#8b5cf6" weight="duotone" />
            </View>
            <View>
              <Text className="text-zinc-400 text-xs font-medium">Today</Text>
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
                This Month
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
                Total Earned
              </Text>
              <Text className="text-white text-xl font-bold">
                ${total.toLocaleString()}
              </Text>
            </View>
          </View>
          <View className="bg-blue-500/10 px-3 py-1.5 rounded-full">
            <Text className="text-blue-400 text-xs font-semibold">
              All Time
            </Text>
          </View>
        </View>
      </View>

      {/* Daily Average */}
      <View className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 p-4 rounded-2xl border border-violet-500/30">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-zinc-400 text-xs font-medium mb-1">
              Daily Average
            </Text>
            <Text className="text-white text-2xl font-bold">
              ${(total / Math.max(new Date().getDate(), 1)).toFixed(2)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-zinc-400 text-xs mb-1">Monthly Est.</Text>
            <Text className="text-violet-400 text-lg font-semibold">
              ${((total / Math.max(new Date().getDate(), 1)) * 30).toFixed(0)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
