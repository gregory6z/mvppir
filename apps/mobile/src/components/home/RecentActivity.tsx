import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { ArrowDown, ArrowUp, Star, ArrowRight } from "phosphor-react-native";
import { formatDistanceToNow } from "date-fns";

type MLMRank = "RECRUIT" | "BRONZE" | "SILVER" | "GOLD";

interface Transaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "COMMISSION";
  tokenSymbol: string;
  tokenAddress: string | null;
  amount: string; // Decimal as string
  txHash: string | null;
  transferTxHash: string | null;
  status: "PENDING" | "CONFIRMED" | "SENT_TO_GLOBAL";
  createdAt: string; // ISO 8601 date string
  // Commission-specific fields
  commissionLevel?: number; // 1, 2, 3 (N1, N2, N3), or 0 for self commission
  fromUserName?: string; // Name of user who generated commission (undefined for self)
  userRank?: MLMRank; // User's rank (for self commission)
}

interface RecentActivityProps {
  transactions: Transaction[];
  maxItems?: number; // Default: 3, Max: 5
  onViewAll: () => void;
  onTransactionPress?: (id: string) => void;
}

export function RecentActivity({
  transactions,
  maxItems = 3,
  onViewAll,
  onTransactionPress,
}: RecentActivityProps) {
  const limitedTransactions = transactions.slice(0, maxItems);

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "PENDING":
        return "text-orange-500";
      case "CONFIRMED":
        return "text-green-500";
      case "SENT_TO_GLOBAL":
        return "text-violet-500";
      default:
        return "text-zinc-400";
    }
  };

  const getStatusLabel = (status: Transaction["status"]) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "CONFIRMED":
        return "Confirmed";
      case "SENT_TO_GLOBAL":
        return "Completed";
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

  const formatAmount = (amount: string, type: Transaction["type"]) => {
    const sign = type === "DEPOSIT" || type === "COMMISSION" ? "+" : "-";
    return `${sign}$${parseFloat(amount).toFixed(2)}`;
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

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isDeposit = item.type === "DEPOSIT";
    const isWithdrawal = item.type === "WITHDRAWAL";
    const isCommission = item.type === "COMMISSION";
    const isSelfCommission = isCommission && item.commissionLevel === 0;

    let Icon = ArrowDown;
    let iconColor = "#10b981";
    let iconBgColor = "bg-green-500/10";
    let amountColor = "text-green-500";

    if (isWithdrawal) {
      Icon = ArrowUp;
      iconColor = "#ef4444";
      iconBgColor = "bg-red-500/10";
      amountColor = "text-red-500";
    } else if (isCommission) {
      Icon = Star;
      iconColor = isSelfCommission ? "#fbbf24" : "#8b5cf6"; // Gold for self, violet for network
      iconBgColor = isSelfCommission ? "bg-yellow-500/10" : "bg-violet-500/10";
      amountColor = "text-green-500";
    }

    const getRankLabel = (rank?: MLMRank) => {
      if (!rank) return "Commission";
      const labels = {
        RECRUIT: "Recruit",
        BRONZE: "Bronze",
        SILVER: "Silver",
        GOLD: "Gold",
      };
      return labels[rank];
    };

    const transactionLabel = isDeposit
      ? "Deposit"
      : isWithdrawal
        ? "Withdrawal"
        : isSelfCommission
          ? `${getRankLabel(item.userRank)} Commission`
          : "Commission";

    return (
      <TouchableOpacity
        onPress={() => onTransactionPress?.(item.id)}
        className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 mb-3 active:bg-zinc-800 active:scale-[0.99]"
        style={{ minHeight: 64 }}
        accessibilityLabel={`${item.type} transaction, ${formatAmount(item.amount, item.type)}`}
        accessibilityRole="button"
      >
        <View className="flex-row items-center gap-3">
          {/* Icon */}
          <View className={`w-11 h-11 rounded-xl items-center justify-center ${iconBgColor}`}>
            <Icon size={20} color={iconColor} weight={isSelfCommission ? "fill" : "bold"} />
          </View>

          {/* Transaction Info */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-white font-semibold text-[15px]">
                  {transactionLabel}
                </Text>
                {/* Commission Level Badge */}
                {isCommission && item.commissionLevel !== undefined && item.commissionLevel > 0 && (
                  <View
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${getLevelColor(item.commissionLevel)}20`,
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: getLevelColor(item.commissionLevel) }}
                    >
                      N{item.commissionLevel}
                    </Text>
                  </View>
                )}
              </View>
              <Text className={`font-bold text-[15px] ${amountColor}`}>
                {formatAmount(item.amount, item.type)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-zinc-400 text-sm" numberOfLines={1}>
                {isCommission && item.fromUserName
                  ? `from ${item.fromUserName}`
                  : isSelfCommission
                    ? "Your blocked balance"
                    : formatRelativeTime(item.createdAt)}
              </Text>
              <View
                className={`px-2 py-0.5 rounded-full ${
                  item.status === "PENDING"
                    ? "bg-orange-500/10"
                    : item.status === "CONFIRMED"
                      ? "bg-green-500/10"
                      : "bg-violet-500/10"
                }`}
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

  if (limitedTransactions.length === 0) {
    return (
      <View className="mx-4 mt-6">
        <Text className="text-white text-lg font-semibold mb-4">
          Recent Activity
        </Text>
        <View className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 items-center">
          <Star size={48} color="#52525b" weight="duotone" />
          <Text className="text-zinc-400 text-center mt-4">
            No transactions yet
          </Text>
          <Text className="text-zinc-500 text-sm text-center mt-1">
            Your transactions will appear here
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
          Recent Activity
        </Text>
        <TouchableOpacity
          onPress={onViewAll}
          className="flex-row items-center gap-1"
          accessibilityLabel="View all transactions"
          accessibilityRole="button"
        >
          <Text className="text-violet-500 text-sm font-medium">
            View All
          </Text>
          <ArrowRight size={16} color="#8b5cf6" weight="bold" />
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      <FlatList
        data={limitedTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );
}
