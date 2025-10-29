import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Star, ArrowRight } from "phosphor-react-native";
import { formatDistanceToNow } from "date-fns";

type MLMRank = "RECRUIT" | "BRONZE" | "SILVER" | "GOLD";
type CommissionStatus = "PENDING" | "PAID" | "CANCELLED";

interface Commission {
  id: string;
  fromUser: {
    name: string;
    rank: MLMRank;
  };
  level: number; // 1, 2, or 3 (N1, N2, N3)
  baseAmount: number; // USD
  percentage: number; // e.g., 1.05
  finalAmount: number; // USD
  referenceDate: string; // ISO 8601
  status: CommissionStatus;
}

interface RecentCommissionsProps {
  commissions: Commission[];
  maxItems?: number; // Default: 5
  onViewAll: () => void;
  onCommissionPress?: (id: string) => void;
}

const RANK_EMOJIS: Record<MLMRank, string> = {
  RECRUIT: "🎖️",
  BRONZE: "🥉",
  SILVER: "🥈",
  GOLD: "🥇",
};

export function RecentCommissions({
  commissions,
  maxItems = 5,
  onViewAll,
  onCommissionPress,
}: RecentCommissionsProps) {
  const limitedCommissions = commissions.slice(0, maxItems);

  const getStatusColor = (status: CommissionStatus) => {
    switch (status) {
      case "PENDING":
        return "text-orange-500";
      case "PAID":
        return "text-green-500";
      case "CANCELLED":
        return "text-red-500";
      default:
        return "text-zinc-400";
    }
  };

  const getStatusLabel = (status: CommissionStatus) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "PAID":
        return "Paid";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const getLevelLabel = (level: number) => {
    return `N${level}`;
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "#8b5cf6"; // Violet
      case 2:
        return "#3b82f6"; // Blue
      case 3:
        return "#10b981"; // Green
      default:
        return "#71717a"; // Zinc
    }
  };

  const renderCommission = ({ item }: { item: Commission }) => {
    return (
      <TouchableOpacity
        onPress={() => onCommissionPress?.(item.id)}
        className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 mb-3 active:bg-zinc-800 active:scale-[0.99]"
        style={{ minHeight: 64 }}
        accessibilityLabel={`Commission from ${item.fromUser.name}, ${item.finalAmount.toFixed(2)} USD`}
        accessibilityRole="button"
      >
        <View className="flex-row items-center gap-3">
          {/* Icon */}
          <View className="w-11 h-11 bg-violet-500/10 rounded-xl items-center justify-center">
            <Star size={20} color="#8b5cf6" weight="fill" />
          </View>

          {/* Commission Info */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-white font-semibold text-[15px]">
                  {item.fromUser.name}
                </Text>
                <Text className="text-base">{RANK_EMOJIS[item.fromUser.rank]}</Text>
              </View>
              <Text className="text-green-500 font-bold text-[15px]">
                +${item.finalAmount.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${getLevelColor(item.level)}20` }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: getLevelColor(item.level) }}
                  >
                    {getLevelLabel(item.level)}
                  </Text>
                </View>
                <Text className="text-zinc-400 text-sm">
                  {formatRelativeTime(item.referenceDate)}
                </Text>
              </View>
              <View
                className="px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor:
                    item.status === "PAID"
                      ? "#10b98120"
                      : item.status === "PENDING"
                        ? "#f59e0b20"
                        : "#ef444420",
                }}
              >
                <Text
                  className={`text-xs font-semibold ${getStatusColor(item.status)}`}
                >
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (limitedCommissions.length === 0) {
    return (
      <View className="mx-4 mt-6">
        <Text className="text-white text-base font-semibold mb-3">
          Recent Commissions
        </Text>
        <View className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 items-center">
          <Star size={48} color="#52525b" weight="duotone" />
          <Text className="text-zinc-400 text-center mt-4">
            No commissions yet
          </Text>
          <Text className="text-zinc-500 text-sm text-center mt-1">
            Start inviting friends to earn daily commissions
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mx-4 mt-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-base font-semibold">
          Recent Commissions
        </Text>
        <TouchableOpacity
          onPress={onViewAll}
          className="flex-row items-center gap-1"
          accessibilityLabel="View all commissions"
          accessibilityRole="button"
        >
          <Text className="text-violet-500 text-sm font-medium">View All</Text>
          <ArrowRight size={16} color="#8b5cf6" weight="bold" />
        </TouchableOpacity>
      </View>

      {/* Commission List */}
      <FlatList
        data={limitedCommissions}
        renderItem={renderCommission}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );
}
