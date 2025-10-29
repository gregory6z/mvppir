import { ScrollView, RefreshControl, View } from "react-native";
import { useState } from "react";
import { Header } from "@/components/home/Header";
import { RankCard } from "@/components/referrals/RankCard";
import { NetworkStats } from "@/components/referrals/NetworkStats";
import { CommissionOverview } from "@/components/referrals/CommissionOverview";
import { ReferralCode } from "@/components/referrals/ReferralCode";
import { RecentCommissions } from "@/components/referrals/RecentCommissions";

// Type definitions
type MLMRank = "RECRUIT" | "BRONZE" | "SILVER" | "GOLD";
type RankStatus = "ACTIVE" | "WARNING" | "TEMPORARY_DOWNRANK" | "DOWNRANKED";

// Mock data for visualization
const MOCK_USER = {
  name: "João Silva",
  avatarUrl: undefined,
  currentRank: "BRONZE" as MLMRank,
  rankStatus: "ACTIVE" as RankStatus,
  blockedBalance: 500, // $500 blocked (meets Bronze requirement)
  referralCode: "GREGORY123",
  referralLink: "https://stakly.com/ref/GREGORY123",
};

const MOCK_NETWORK_STATS = {
  totalDirects: 8, // Lifetime
  activeDirects: 6, // Active this month
  lifetimeVolume: 12500, // $12,500 total
  levels: {
    N1: { count: 8, totalBalance: 4000 }, // 8 direct referrals with $4K total
    N2: { count: 24, totalBalance: 8500 }, // 24 in level 2 with $8.5K total
    N3: { count: 48, totalBalance: 12000 }, // 48 in level 3 with $12K total
  },
};

// Progress to next rank (Silver)
const MOCK_PROGRESS = {
  directs: { current: 8, required: 5 }, // Already met (8 > 5)
  volume: { current: 12500, required: 30000 }, // Need $17.5K more
  blockedBalance: { current: 500, required: 2000 }, // Need $1.5K more
};

const MOCK_COMMISSIONS_SUMMARY = {
  today: 15.75, // $15.75 today
  thisMonth: 412.5, // $412.50 this month
  total: 1847.25, // $1,847.25 lifetime
};

const MOCK_COMMISSIONS = [
  {
    id: "1",
    fromUser: { name: "João Silva", rank: "BRONZE" as MLMRank },
    level: 1,
    baseAmount: 500,
    percentage: 1.05,
    finalAmount: 5.25,
    referenceDate: new Date().toISOString(),
    status: "PAID" as const,
  },
  {
    id: "2",
    fromUser: { name: "Maria Santos", rank: "RECRUIT" as MLMRank },
    level: 1,
    baseAmount: 300,
    percentage: 1.05,
    finalAmount: 3.15,
    referenceDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    status: "PAID" as const,
  },
  {
    id: "3",
    fromUser: { name: "Pedro Costa", rank: "SILVER" as MLMRank },
    level: 2,
    baseAmount: 1000,
    percentage: 0.15,
    finalAmount: 1.5,
    referenceDate: new Date(Date.now() - 86400000).toISOString(),
    status: "PAID" as const,
  },
  {
    id: "4",
    fromUser: { name: "Ana Oliveira", rank: "BRONZE" as MLMRank },
    level: 1,
    baseAmount: 450,
    percentage: 1.05,
    finalAmount: 4.73,
    referenceDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    status: "PENDING" as const,
  },
  {
    id: "5",
    fromUser: { name: "Carlos Pereira", rank: "RECRUIT" as MLMRank },
    level: 3,
    baseAmount: 200,
    percentage: 0.1,
    finalAmount: 0.2,
    referenceDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    status: "PAID" as const,
  },
];

export function ReferralsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const notificationCount = 3;

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
    console.log("Referrals data refreshed!");
  };

  const handleAvatarPress = () => {
    console.log("Avatar pressed - navigate to Profile");
  };

  const handleNotificationPress = () => {
    console.log("Notification pressed - open notifications");
  };

  const handleViewAllCommissions = () => {
    console.log("View all commissions - navigate to full list");
  };

  const handleCommissionPress = (id: string) => {
    console.log(`Commission ${id} pressed - show details`);
  };

  return (
    <>
      {/* Header */}
      <Header
        userName={MOCK_USER.name}
        avatarUrl={MOCK_USER.avatarUrl}
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
        {/* Rank Card */}
        <RankCard
          currentRank={MOCK_USER.currentRank}
          rankStatus={MOCK_USER.rankStatus}
          blockedBalance={MOCK_USER.blockedBalance}
          nextRank="SILVER"
          progressToNext={MOCK_PROGRESS}
        />

        {/* Referral Code */}
        <ReferralCode
          referralCode={MOCK_USER.referralCode}
          referralLink={MOCK_USER.referralLink}
        />

        {/* Network Stats */}
        <NetworkStats
          totalDirects={MOCK_NETWORK_STATS.totalDirects}
          activeDirects={MOCK_NETWORK_STATS.activeDirects}
          lifetimeVolume={MOCK_NETWORK_STATS.lifetimeVolume}
          levels={MOCK_NETWORK_STATS.levels}
        />

        {/* Commission Overview */}
        <CommissionOverview
          today={MOCK_COMMISSIONS_SUMMARY.today}
          thisMonth={MOCK_COMMISSIONS_SUMMARY.thisMonth}
          total={MOCK_COMMISSIONS_SUMMARY.total}
        />

        {/* Recent Commissions */}
        <RecentCommissions
          commissions={MOCK_COMMISSIONS}
          maxItems={5}
          onViewAll={handleViewAllCommissions}
          onCommissionPress={handleCommissionPress}
        />
      </ScrollView>
    </>
  );
}
