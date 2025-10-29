import { ScrollView, View, RefreshControl, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/home/Header";
import { BalanceCard } from "@/components/home/BalanceCard";
import { QuickActions } from "@/components/home/QuickActions";
import { RecentActivity } from "@/components/home/RecentActivity";
import { TabBar } from "@/components/navigation/TabBar";
import { ReferralsScreen } from "@/screens/referrals/ReferralsScreen";
import { WalletScreen } from "@/screens/wallet/WalletScreen";
import { DepositScreen } from "@/screens/deposit/DepositScreen";
import { ProfileScreen } from "@/screens/profile/ProfileScreen";
import { useUIStore } from "@/stores/ui.store";
import { useUserAccount } from "@/api/user/queries/use-user-account-query";
import { useUserBalance } from "@/api/user/queries/use-user-balance-query";
import { useUnifiedTransactions } from "@/api/user/queries/use-unified-transactions-query";

export function HomeScreen() {
  const { t } = useTranslation("home.home");
  const { isBalanceVisible, toggleBalanceVisibility } = useUIStore();
  const { data: userAccount, isLoading: isLoadingAccount, refetch: refetchAccount } = useUserAccount();
  const { data: balanceData, isLoading: isLoadingBalance, refetch: refetchBalance } = useUserBalance();
  // Fetch recent transactions for display (4 items)
  const { data: transactionsData, isLoading: isLoadingTransactions, refetch: refetchTransactions } = useUnifiedTransactions({ limit: 4 });

  const [activeTab, setActiveTab] = useState<
    "home" | "wallet" | "referrals" | "profile"
  >("home");
  const [showDepositScreen, setShowDepositScreen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const totalBalance = balanceData?.totalUSD || 0;
  const monthlyYieldPercentage = balanceData?.monthlyYieldPercentage || 0;
  const notificationCount = 0; // TODO: implement notifications
  const recentTransactions = transactionsData?.transactions || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAccount(), refetchBalance(), refetchTransactions()]);
    setRefreshing(false);
  };

  const handleAvatarPress = () => {
    console.log("Avatar pressed - navigate to Profile");
    setActiveTab("profile");
  };

  const handleNotificationPress = () => {
    console.log("Notification pressed - open notifications");
  };

  const handleDepositPress = () => {
    setShowDepositScreen(true);
  };

  const handleWithdrawPress = () => {
    console.log("Withdraw pressed - navigate to Withdraw screen");
  };

  const handleReferPress = () => {
    console.log("Refer pressed - navigate to Referrals");
    setActiveTab("referrals");
  };

  const handleViewAllTransactions = () => {
    console.log("View all pressed - navigate to Wallet tab");
    setActiveTab("wallet");
  };

  const handleTransactionPress = (id: string) => {
    console.log(`Transaction ${id} pressed - show details`);
  };

  const handleTabPress = (tab: "home" | "wallet" | "referrals" | "profile") => {
    console.log(`Tab pressed: ${tab}`);
    setActiveTab(tab);
  };

  // Loading state
  if (isLoadingAccount || isLoadingBalance || isLoadingTransactions) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950 items-center justify-center" edges={["left", "right"]}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </SafeAreaView>
    );
  }

  // Error state
  if (!userAccount || !balanceData || !transactionsData) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950 items-center justify-center" edges={["left", "right"]}>
        <Text className="text-white text-base">{t("errors.loadFailed")}</Text>
      </SafeAreaView>
    );
  }

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            {/* Header */}
            <Header
              userName={userAccount.name}
              avatarUrl={undefined}
              notificationCount={notificationCount}
              onAvatarPress={handleAvatarPress}
              onNotificationPress={handleNotificationPress}
            />

            {/* Scrollable Content with Pull-to-Refresh */}
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#8b5cf6"
                  colors={["#8b5cf6"]}
                />
              }
            >
              {/* Balance Card - More breathing room */}
              <View className="mb-2">
                <BalanceCard
                  totalBalance={totalBalance}
                  percentChange={monthlyYieldPercentage}
                  period="month"
                  isBalanceVisible={isBalanceVisible}
                  onToggleVisibility={toggleBalanceVisibility}
                />
              </View>

              {/* Quick Actions - More spacing */}
              <View className="mb-2">
                <QuickActions
                  onDepositPress={handleDepositPress}
                  onWithdrawPress={handleWithdrawPress}
                  onReferPress={handleReferPress}
                />
              </View>

              {/* Recent Activity */}
              <RecentActivity
                transactions={recentTransactions}
                maxItems={4}
                onViewAll={handleViewAllTransactions}
                onTransactionPress={handleTransactionPress}
                isBalanceVisible={isBalanceVisible}
              />
            </ScrollView>
          </>
        );

      case "referrals":
        return <ReferralsScreen />;

      case "wallet":
        return <WalletScreen />;

      case "profile":
        return <ProfileScreen />;

      default:
        return null;
    }
  };

  // Show deposit screen if active
  if (showDepositScreen) {
    return <DepositScreen onBack={() => setShowDepositScreen(false)} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={["left", "right"]}>
      {/* Tab Content */}
      {renderTabContent()}

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
}
