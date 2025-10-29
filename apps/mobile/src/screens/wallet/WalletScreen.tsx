import { View, Text, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/home/Header";
import { useUserAccount } from "@/api/user/queries/use-user-account-query";
import { useInfiniteUnifiedTransactions } from "@/api/user/queries/use-infinite-unified-transactions-query";
import { useUIStore } from "@/stores/ui.store";
import { TransactionItem } from "@/components/wallet/TransactionItem";
import type { UnifiedTransaction } from "@/api/user/queries/use-unified-transactions-query";

type TransactionWithDate = UnifiedTransaction & {
  dateLabel?: string;
  showDateHeader?: boolean;
};

export function WalletScreen() {
  const { t, i18n } = useTranslation("wallet.wallet");
  const { data: userAccount } = useUserAccount();
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteUnifiedTransactions();
  const { isBalanceVisible } = useUIStore();

  const handleTransactionPress = (id: string) => {
    console.log(`Transaction ${id} pressed - show details`);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Flatten all pages and add date headers
  const transactionsWithHeaders = useMemo(() => {
    if (!data?.pages) return [];

    const allTransactions = data.pages.flatMap((page) => page.transactions);
    const withHeaders: TransactionWithDate[] = [];
    let lastDateLabel = "";

    allTransactions.forEach((tx) => {
      const date = new Date(tx.createdAt);
      let dateLabel: string;

      if (isToday(date)) {
        dateLabel = t("dateLabels.today");
      } else if (isYesterday(date)) {
        dateLabel = t("dateLabels.yesterday");
      } else {
        const locale = i18n.language === "pt" ? ptBR : undefined;
        dateLabel = format(date, "d 'de' MMMM", { locale });
      }

      // Add date header if this is a new date
      if (dateLabel !== lastDateLabel) {
        withHeaders.push({
          ...tx,
          dateLabel,
          showDateHeader: true,
        });
        lastDateLabel = dateLabel;
      } else {
        withHeaders.push({
          ...tx,
          showDateHeader: false,
        });
      }
    });

    return withHeaders;
  }, [data, t, i18n.language]);

  const totalCount = data?.pages[0]?.pagination.total || 0;

  const renderItem = ({ item }: { item: TransactionWithDate }) => (
    <>
      {item.showDateHeader && (
        <View className="bg-zinc-950 px-4 py-2">
          <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            {item.dateLabel}
          </Text>
        </View>
      )}
      <TransactionItem
        transaction={item}
        isBalanceVisible={isBalanceVisible}
        onPress={() => handleTransactionPress(item.id)}
      />
    </>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#8b5cf6" />
      </View>
    );
  };

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
          {totalCount === 1
            ? t("subtitle", { count: 1 })
            : t("subtitle_plural", { count: totalCount })}
        </Text>
      </View>

      {/* Transactions List */}
      <FlatList
        data={transactionsWithHeaders}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
            tintColor="#8b5cf6"
            colors={["#8b5cf6"]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
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
