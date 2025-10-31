import { ScrollView, RefreshControl, View, Text, ActivityIndicator } from "react-native"
import { Header } from "@/components/home/Header"
import { RankCard } from "@/components/referrals/RankCard"
import { NetworkStats } from "@/components/referrals/NetworkStats"
import { CommissionOverview } from "@/components/referrals/CommissionOverview"
import { ReferralCode } from "@/components/referrals/ReferralCode"
import { RecentCommissions } from "@/components/referrals/RecentCommissions"
import { useMLMProfile } from "@/api/mlm/queries/use-mlm-profile-query"
import { useCommissionsSummary } from "@/api/mlm/queries/use-commissions-summary-query"
import { useRecentCommissions } from "@/api/mlm/queries/use-recent-commissions-query"
import { useUserReferralLink } from "@/api/user/queries/use-user-referral-link-query"
import type { MLMRank } from "@/api/mlm/schemas/mlm.schema"

export function ReferralsScreen() {
  const notificationCount = 3

  // Fetch data from API
  const mlmProfile = useMLMProfile()
  const commissionsSummary = useCommissionsSummary()
  const recentCommissions = useRecentCommissions(5)
  const referralLink = useUserReferralLink()

  // Combined loading state
  const isLoading =
    mlmProfile.isLoading ||
    commissionsSummary.isLoading ||
    recentCommissions.isLoading ||
    referralLink.isLoading

  // Combined error state
  const hasError =
    mlmProfile.isError ||
    commissionsSummary.isError ||
    recentCommissions.isError ||
    referralLink.isError

  // Refetch all data
  const onRefresh = async () => {
    await Promise.all([
      mlmProfile.refetch(),
      commissionsSummary.refetch(),
      recentCommissions.refetch(),
      referralLink.refetch(),
    ])
  }

  const handleAvatarPress = () => {
    console.log("Avatar pressed - navigate to Profile")
  }

  const handleNotificationPress = () => {
    console.log("Notification pressed - open notifications")
  }

  const handleViewAllCommissions = () => {
    console.log("View all commissions - navigate to full list")
  }

  const handleCommissionPress = (id: string) => {
    console.log(`Commission ${id} pressed - show details`)
  }

  // Loading state
  if (isLoading && !mlmProfile.data) {
    return (
      <>
        <Header
          userName="Carregando..."
          avatarUrl={undefined}
          notificationCount={0}
          onAvatarPress={handleAvatarPress}
          onNotificationPress={handleNotificationPress}
        />
        <View className="flex-1 justify-center items-center bg-zinc-950">
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text className="text-zinc-400 mt-4">Carregando dados...</Text>
        </View>
      </>
    )
  }

  // Error state
  if (hasError) {
    return (
      <>
        <Header
          userName="Erro"
          avatarUrl={undefined}
          notificationCount={0}
          onAvatarPress={handleAvatarPress}
          onNotificationPress={handleNotificationPress}
        />
        <View className="flex-1 justify-center items-center bg-zinc-950 px-6">
          <Text className="text-red-500 text-lg font-bold mb-2">Erro ao carregar dados</Text>
          <Text className="text-zinc-400 text-center">
            {mlmProfile.error?.message ||
             commissionsSummary.error?.message ||
             recentCommissions.error?.message ||
             referralLink.error?.message ||
             "Ocorreu um erro desconhecido"}
          </Text>
          <Text
            className="text-purple-500 mt-4 font-semibold"
            onPress={() => onRefresh()}
          >
            Tentar novamente
          </Text>
        </View>
      </>
    )
  }

  // Get data with fallbacks
  const userData = mlmProfile.data?.user
  const networkData = mlmProfile.data?.network
  const nextRankData = mlmProfile.data?.nextRankPreview
  const commissionsData = commissionsSummary.data
  const recentCommissionsData = recentCommissions.data?.commissions || []
  const referralData = referralLink.data

  // Map commission level to fromUser data (from recent commissions)
  const mappedCommissions = recentCommissionsData.map((commission) => ({
    id: commission.id,
    fromUser: {
      name: commission.fromUserName,
      rank: "RECRUIT" as MLMRank, // We don't have rank in response, using default
    },
    level: commission.level,
    baseAmount: commission.baseAmount,
    percentage: commission.percentage,
    finalAmount: commission.finalAmount,
    referenceDate: commission.referenceDate,
    status: commission.status,
  }))

  // Calculate progress to next rank
  const progressToNext = nextRankData ? {
    directs: {
      current: nextRankData.requirements.directs.actual,
      required: nextRankData.requirements.directs.required,
    },
    blockedBalance: {
      current: nextRankData.requirements.blockedBalance.actual,
      required: nextRankData.requirements.blockedBalance.required,
    },
  } : undefined

  return (
    <>
      {/* Header */}
      <Header
        userName={userData?.name || "Usuário"}
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
            refreshing={mlmProfile.isFetching}
            onRefresh={onRefresh}
            tintColor="#8b5cf6"
            colors={["#8b5cf6"]}
          />
        }
      >
        {/* Rank Card */}
        {userData && (
          <RankCard
            currentRank={userData.currentRank}
            rankStatus={userData.rankStatus}
            blockedBalance={userData.blockedBalance}
            nextRank={nextRankData?.rank}
            progressToNext={progressToNext}
          />
        )}

        {/* Referral Code */}
        {referralData && (
          <ReferralCode
            referralCode={referralData.referralCode}
            referralLink={referralData.referralLink}
          />
        )}

        {/* Network Stats */}
        {networkData && (
          <NetworkStats
            totalDirects={networkData.totalDirects}
            activeDirects={networkData.activeDirects}
            levels={networkData.levels}
          />
        )}

        {/* Commission Overview */}
        {commissionsData && (
          <CommissionOverview
            today={commissionsData.today}
            thisMonth={commissionsData.thisMonth}
            total={commissionsData.total}
          />
        )}

        {/* Recent Commissions */}
        <RecentCommissions
          commissions={mappedCommissions}
          maxItems={5}
          onViewAll={handleViewAllCommissions}
          onCommissionPress={handleCommissionPress}
        />
      </ScrollView>
    </>
  )
}
