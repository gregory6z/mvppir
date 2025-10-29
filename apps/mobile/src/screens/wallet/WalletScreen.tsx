import { View, Text, SectionList, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/home/Header";
import { useUserAccount } from "@/api/user/queries/use-user-account-query";
import { useUnifiedTransactions, UnifiedTransaction } from "@/api/user/queries/use-unified-transactions-query";
import { useUIStore } from "@/stores/ui.store";
import { TransactionItem } from "@/components/wallet/TransactionItem";

interface TransactionSection {
  title: string;
  data: UnifiedTransaction[];
}

export function WalletScreen() {
  const { t, i18n } = useTranslation("wallet.wallet");
  const { data: userAccount } = useUserAccount();
  const { data: transactionsData, isLoading, refetch } = useUnifiedTransactions({ limit: 100 });
  const { isBalanceVisible } = useUIStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleTransactionPress = (id: string) => {
    console.log(`Transaction ${id} pressed - show details`);
  };

  // Group transactions by date
  const groupTransactionsByDate = (transactions: UnifiedTransaction[]): TransactionSection[] => {
    const groups = new Map<string, UnifiedTransaction[]>();

    transactions.forEach((tx) => {
      const date = new Date(tx.createdAt);
      let dateKey: string;

      if (isToday(date)) {
        dateKey = t("dateLabels.today");
      } else if (isYesterday(date)) {
        dateKey = t("dateLabels.yesterday");
      } else {
        // Format: "15 de outubro" or "October 15" depending on language
        const locale = i18n.language === "pt" ? ptBR : undefined;
        dateKey = format(date, "d 'de' MMMM", { locale });
      }

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(tx);
    });

    return Array.from(groups.entries()).map(([title, data]) => ({
      title,
      data,
    }));
  };

  const sections = transactionsData?.transactions
    ? groupTransactionsByDate(transactionsData.transactions)
    : [];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950" edges={["left", "right"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={["left", "right"]}>
      {/* Header */}
      <Header
        userName={userAccount?.name || ""}
        avatarUrl={undefined}
        notificationCount={0}
        onAvatarPress={() => console.log("Avatar pressed")}
        onNotificationPress={() => console.log("Notification pressed")}
      />

      {/* Title */}
      <View className="px-4 py-4">
        <Text className="text-white text-2xl font-bold">{t("title")}</Text>
        <Text className="text-zinc-400 text-sm mt-1">
          {transactionsData?.transactions.length === 1
            ? t("subtitle", { count: 1 })
            : t("subtitle_plural", { count: transactionsData?.transactions.length || 0 })}
        </Text>
      </View>

      {/* Transactions List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            isBalanceVisible={isBalanceVisible}
            onPress={() => handleTransactionPress(item.id)}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View className="bg-zinc-950 px-4 py-2">
            <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              {title}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8b5cf6"
            colors={["#8b5cf6"]}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-zinc-500 text-base">{t("empty.title")}</Text>
            <Text className="text-zinc-600 text-sm mt-2">{t("empty.subtitle")}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
