import { View, Text } from "react-native";
import { LockKey } from "phosphor-react-native";

interface ActivationBannerProps {
  currentBalance: number; // USD
  requiredAmount?: number; // USD (default: 100)
}

export function ActivationBanner({
  currentBalance,
  requiredAmount = 100,
}: ActivationBannerProps) {
  const remaining = Math.max(0, requiredAmount - currentBalance);
  const progress = Math.min(100, (currentBalance / requiredAmount) * 100);

  return (
    <View className="mx-4 mt-4 bg-violet-500/10 rounded-3xl p-5 border border-violet-500/30">
      {/* Header */}
      <View className="flex-row items-center gap-3 mb-4">
        <View className="w-12 h-12 bg-violet-500/20 rounded-2xl items-center justify-center">
          <LockKey size={24} color="#8b5cf6" weight="duotone" />
        </View>
        <View className="flex-1">
          <Text className="text-white text-base font-bold">
            Account Activation
          </Text>
          <Text className="text-zinc-400 text-sm">
            Deposit ${remaining.toFixed(2)} to activate
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="mb-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-zinc-400 text-xs font-medium">Progress</Text>
          <Text className="text-violet-400 text-xs font-bold">
            {progress.toFixed(0)}%
          </Text>
        </View>
        <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <View
            className="h-full bg-violet-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      {/* Balance Info */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-zinc-500 text-xs">Current Balance</Text>
          <Text className="text-white text-sm font-semibold">
            ${currentBalance.toFixed(2)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-zinc-500 text-xs">Required</Text>
          <Text className="text-violet-400 text-sm font-semibold">
            ${requiredAmount.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}
