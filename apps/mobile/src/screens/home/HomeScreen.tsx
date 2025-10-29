import { ScrollView, View, RefreshControl, Alert, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Header } from "@/components/home/Header";
import { BalanceCard } from "@/components/home/BalanceCard";
import { QuickActions } from "@/components/home/QuickActions";
import { RecentActivity } from "@/components/home/RecentActivity";
import { TabBar } from "@/components/navigation/TabBar";
import { ReferralsScreen } from "@/screens/referrals/ReferralsScreen";
import { useAuthStore } from "@/stores/auth.store";
import { useUserAccount } from "@/api/user/queries/use-user-account-query";

const MOCK_TRANSACTIONS = [
  {
    id: "1",
    type: "COMMISSION" as const,
    tokenSymbol: "USD",
    tokenAddress: null,
    amount: "5.25",
    txHash: null,
    transferTxHash: null,
    status: "CONFIRMED" as const,
    createdAt: new Date().toISOString(),
    commissionLevel: 0, // Self commission (daily yield)
    fromUserName: undefined,
    userRank: "BRONZE" as const, // User's current rank
  },
  {
    id: "2",
    type: "COMMISSION" as const,
    tokenSymbol: "USD",
    tokenAddress: null,
    amount: "3.15",
    txHash: null,
    transferTxHash: null,
    status: "CONFIRMED" as const,
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    commissionLevel: 1,
    fromUserName: "João Silva",
  },
  {
    id: "3",
    type: "DEPOSIT" as const,
    tokenSymbol: "USDC",
    tokenAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    amount: "500.00",
    txHash: "0x123...",
    transferTxHash: null,
    status: "CONFIRMED" as const,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: "4",
    type: "COMMISSION" as const,
    tokenSymbol: "USD",
    tokenAddress: null,
    amount: "1.50",
    txHash: null,
    transferTxHash: null,
    status: "CONFIRMED" as const,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    commissionLevel: 2,
    fromUserName: "Pedro Costa",
  },
  {
    id: "5",
    type: "WITHDRAWAL" as const,
    tokenSymbol: "USDT",
    tokenAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    amount: "150.00",
    txHash: null,
    transferTxHash: null,
    status: "PENDING" as const,
    createdAt: new Date(Date.now() - 129600000).toISOString(), // 1.5 days ago
  },
  {
    id: "6",
    type: "COMMISSION" as const,
    tokenSymbol: "USD",
    tokenAddress: null,
    amount: "0.20",
    txHash: null,
    transferTxHash: null,
    status: "CONFIRMED" as const,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    commissionLevel: 3,
    fromUserName: "Carlos Pereira",
  },
  {
    id: "7",
    type: "DEPOSIT" as const,
    tokenSymbol: "MATIC",
    tokenAddress: null,
    amount: "75.50",
    txHash: "0x456...",
    transferTxHash: null,
    status: "CONFIRMED" as const,
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
];

export function HomeScreen() {
  const { clearAuth } = useAuthStore();
  const { data: userAccount, isLoading: isLoadingAccount, refetch: refetchAccount } = useUserAccount();
  const [activeTab, setActiveTab] = useState<
    "home" | "wallet" | "referrals" | "profile"
  >("home");
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock balance data (TODO: replace with real data)
  const totalBalance = 1234.56;
  const percentChange = 12.5;
  const notificationCount = 0; // TODO: implement notifications

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchAccount();
    setRefreshing(false);
  };

  const handleAvatarPress = () => {
    Alert.alert(
      "Logout",
      "Do you want to logout from your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            clearAuth();
            console.log("User logged out");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleNotificationPress = () => {
    console.log("Notification pressed - open notifications");
  };

  const handleDepositPress = () => {
    console.log("Deposit pressed - navigate to Deposit screen");
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

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible((prev) => !prev);
  };

  // Loading state
  if (isLoadingAccount) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950 items-center justify-center" edges={["left", "right"]}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </SafeAreaView>
    );
  }

  // Error state
  if (!userAccount) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950 items-center justify-center" edges={["left", "right"]}>
        <Text className="text-white text-base">Failed to load user data</Text>
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
                  percentChange={percentChange}
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
                transactions={MOCK_TRANSACTIONS}
                maxItems={6}
                onViewAll={handleViewAllTransactions}
                onTransactionPress={handleTransactionPress}
              />
            </ScrollView>
          </>
        );

      case "referrals":
        return <ReferralsScreen />;

      case "wallet":
        return (
          <View className="flex-1 items-center justify-center">
            <Header
              userName={userAccount.name}
              avatarUrl={undefined}
              notificationCount={notificationCount}
              onAvatarPress={handleAvatarPress}
              onNotificationPress={handleNotificationPress}
            />
            <View className="flex-1 items-center justify-center">
              {/* TODO: Implement WalletScreen */}
            </View>
          </View>
        );

      case "profile":
        return (
          <View className="flex-1 items-center justify-center">
            <Header
              userName={userAccount.name}
              avatarUrl={undefined}
              notificationCount={notificationCount}
              onAvatarPress={handleAvatarPress}
              onNotificationPress={handleNotificationPress}
            />
            <View className="flex-1 items-center justify-center">
              {/* TODO: Implement ProfileScreen */}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={["left", "right"]}>
      {/* Tab Content */}
      {renderTabContent()}

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
}
