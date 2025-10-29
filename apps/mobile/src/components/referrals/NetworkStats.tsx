import { View, Text } from "react-native";
import { Users, UserCheck, TrendUp } from "phosphor-react-native";

interface NetworkStatsProps {
  totalDirects: number; // Lifetime count
  activeDirects: number; // Active this month
  lifetimeVolume: number; // USD
  levels: {
    N1: { count: number; totalBalance: number };
    N2: { count: number; totalBalance: number };
    N3: { count: number; totalBalance: number };
  };
}

export function NetworkStats({
  totalDirects,
  activeDirects,
  lifetimeVolume,
  levels,
}: NetworkStatsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(1)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  return (
    <View className="mx-4 mt-4">
      <Text className="text-white text-base font-semibold mb-3">
        Network Overview
      </Text>

      {/* Summary Cards */}
      <View className="flex-row gap-3 mb-3">
        {/* Total Directs */}
        <View className="flex-1 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-8 h-8 bg-violet-500/20 rounded-lg items-center justify-center">
              <Users size={18} color="#8b5cf6" weight="bold" />
            </View>
            <Text className="text-zinc-400 text-xs font-medium">
              Total Directs
            </Text>
          </View>
          <Text className="text-white text-2xl font-bold">{totalDirects}</Text>
          <Text className="text-zinc-500 text-xs mt-1">Lifetime</Text>
        </View>

        {/* Active Directs */}
        <View className="flex-1 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-8 h-8 bg-green-500/20 rounded-lg items-center justify-center">
              <UserCheck size={18} color="#10b981" weight="bold" />
            </View>
            <Text className="text-zinc-400 text-xs font-medium">
              Active Now
            </Text>
          </View>
          <Text className="text-white text-2xl font-bold">{activeDirects}</Text>
          <Text className="text-zinc-500 text-xs mt-1">This month</Text>
        </View>
      </View>

      {/* Lifetime Volume */}
      <View className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3">
        <View className="flex-row items-center gap-2 mb-2">
          <View className="w-8 h-8 bg-violet-500/20 rounded-lg items-center justify-center">
            <TrendUp size={18} color="#8b5cf6" weight="bold" />
          </View>
          <Text className="text-zinc-400 text-xs font-medium">
            Lifetime Network Volume
          </Text>
        </View>
        <Text className="text-white text-3xl font-bold">
          ${lifetimeVolume.toLocaleString()}
        </Text>
        <Text className="text-zinc-500 text-xs mt-1">
          Total deposits from your network
        </Text>
      </View>

      {/* Network Levels Breakdown */}
      <View className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <Text className="text-white text-sm font-semibold mb-3">
          Network Levels
        </Text>

        {/* N1 */}
        <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-zinc-800">
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <View className="w-6 h-6 bg-violet-500/20 rounded items-center justify-center">
                <Text className="text-violet-400 text-xs font-bold">N1</Text>
              </View>
              <Text className="text-zinc-400 text-xs">Direct Referrals</Text>
            </View>
            <Text className="text-white text-base font-semibold">
              {levels.N1.count} people
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-zinc-400 text-xs mb-1">Total Balance</Text>
            <Text className="text-white text-base font-semibold">
              {formatNumber(levels.N1.totalBalance)}
            </Text>
          </View>
        </View>

        {/* N2 */}
        <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-zinc-800">
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <View className="w-6 h-6 bg-blue-500/20 rounded items-center justify-center">
                <Text className="text-blue-400 text-xs font-bold">N2</Text>
              </View>
              <Text className="text-zinc-400 text-xs">2nd Level</Text>
            </View>
            <Text className="text-white text-base font-semibold">
              {levels.N2.count} people
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-zinc-400 text-xs mb-1">Total Balance</Text>
            <Text className="text-white text-base font-semibold">
              {formatNumber(levels.N2.totalBalance)}
            </Text>
          </View>
        </View>

        {/* N3 */}
        <View className="flex-row items-center justify-between">
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <View className="w-6 h-6 bg-green-500/20 rounded items-center justify-center">
                <Text className="text-green-400 text-xs font-bold">N3</Text>
              </View>
              <Text className="text-zinc-400 text-xs">3rd Level</Text>
            </View>
            <Text className="text-white text-base font-semibold">
              {levels.N3.count} people
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-zinc-400 text-xs mb-1">Total Balance</Text>
            <Text className="text-white text-base font-semibold">
              {formatNumber(levels.N3.totalBalance)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
