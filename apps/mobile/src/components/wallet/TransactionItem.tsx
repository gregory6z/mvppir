import { View, Text, TouchableOpacity } from "react-native";
import { ArrowDown, ArrowUp, Star } from "phosphor-react-native";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import type { UnifiedTransaction } from "@/api/user/queries/use-unified-transactions-query";

interface TransactionItemProps {
  transaction: UnifiedTransaction;
  isBalanceVisible: boolean;
  onPress: () => void;
}

export function TransactionItem({
  transaction,
  isBalanceVisible,
  onPress,
}: TransactionItemProps) {
  const { t } = useTranslation("home.home");

  const isDeposit = transaction.type === "DEPOSIT";
  const isWithdrawal = transaction.type === "WITHDRAWAL";
  const isCommission = transaction.type === "COMMISSION";
  const isSelfCommission = isCommission && transaction.commissionLevel === 0;

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
    iconColor = isSelfCommission ? "#fbbf24" : "#8b5cf6";
    iconBgColor = isSelfCommission ? "bg-yellow-500/10" : "bg-violet-500/10";
    amountColor = "text-green-500";
  }

  const formatAmount = (amount: string, type: UnifiedTransaction["type"]) => {
    const sign = type === "DEPOSIT" || type === "COMMISSION" ? "+" : "-";
    return `${sign}$${parseFloat(amount).toFixed(2)}`;
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm");
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

  const getStatusColor = (status: UnifiedTransaction["status"]) => {
    switch (status) {
      case "PENDING":
        return "text-orange-500";
      case "CONFIRMED":
        return "text-green-500";
      case "SENT_TO_GLOBAL":
        return "text-violet-500";
      case "PAID":
        return "text-green-500";
      default:
        return "text-zinc-400";
    }
  };

  const getStatusLabel = (status: UnifiedTransaction["status"]) => {
    switch (status) {
      case "PENDING":
        return t("recentActivity.status.pending");
      case "CONFIRMED":
        return t("recentActivity.status.confirmed");
      case "SENT_TO_GLOBAL":
        return t("recentActivity.status.completed");
      case "PAID":
        return t("recentActivity.status.confirmed");
      default:
        return status;
    }
  };

  const getRankLabel = (rank?: string) => {
    if (!rank) return "";
    const rankKey = rank.toLowerCase() as "recruit" | "bronze" | "silver" | "gold";
    return t(`recentActivity.rankLabels.${rankKey}`);
  };

  const transactionLabel = isDeposit
    ? t("recentActivity.types.deposit")
    : isWithdrawal
      ? t("recentActivity.types.withdrawal")
      : isSelfCommission
        ? transaction.userRank
          ? `${getRankLabel(transaction.userRank)} ${t("recentActivity.types.commission")}`
          : t("recentActivity.types.commission")
        : t("recentActivity.types.commission");

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-zinc-900 mx-4 mb-3 p-4 rounded-2xl border border-zinc-800 active:bg-zinc-800 active:scale-[0.99]"
      accessibilityLabel={`${transaction.type} transaction, ${formatAmount(transaction.amount, transaction.type)}`}
      accessibilityRole="button"
    >
      <View className="flex-row items-center gap-3">
        {/* Icon */}
        <View className={`w-12 h-12 rounded-xl items-center justify-center ${iconBgColor}`}>
          <Icon size={22} color={iconColor} weight={isSelfCommission ? "fill" : "bold"} />
        </View>

        {/* Transaction Info */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center gap-2 flex-1">
              <Text className="text-white font-semibold text-base">
                {transactionLabel}
              </Text>
              {/* Commission Level Badge */}
              {isCommission && transaction.commissionLevel !== undefined && transaction.commissionLevel > 0 && (
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${getLevelColor(transaction.commissionLevel)}20`,
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: getLevelColor(transaction.commissionLevel) }}
                  >
                    N{transaction.commissionLevel}
                  </Text>
                </View>
              )}
            </View>
            <Text className={`font-bold text-base ${amountColor}`}>
              {isBalanceVisible ? formatAmount(transaction.amount, transaction.type) : "$ ••••"}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-zinc-400 text-sm">
                {formatTime(transaction.createdAt)}
              </Text>
              {isCommission && transaction.fromUserName && (
                <Text className="text-zinc-400 text-sm" numberOfLines={1}>
                  • {t("recentActivity.commissionFrom")} {transaction.fromUserName}
                </Text>
              )}
              {isSelfCommission && (
                <Text className="text-zinc-400 text-sm" numberOfLines={1}>
                  • {t("recentActivity.selfCommission")}
                </Text>
              )}
            </View>
            <View
              className={`px-2 py-0.5 rounded-full ${
                transaction.status === "PENDING"
                  ? "bg-orange-500/10"
                  : transaction.status === "CONFIRMED" || transaction.status === "PAID"
                    ? "bg-green-500/10"
                    : "bg-violet-500/10"
              }`}
            >
              <Text className={`text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                {getStatusLabel(transaction.status)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
