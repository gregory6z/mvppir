import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/layout/Header"
import { BottomNavigation } from "@/components/navigation/BottomNavigation"
import { RankCard } from "@/components/network/RankCard"
import { ReferralCode } from "@/components/network/ReferralCode"
import { NetworkStats } from "@/components/network/NetworkStats"
import { CommissionOverview } from "@/components/network/CommissionOverview"
import { RecentCommissions } from "@/components/network/RecentCommissions"
import { useMLMProfile } from "@/api/mlm/queries/use-mlm-profile"
import { useCommissionsSummary } from "@/api/mlm/queries/use-commissions-summary"
import { useRecentCommissions } from "@/api/mlm/queries/use-recent-commissions"
import { useUserReferralLink } from "@/api/user/queries/use-user-referral-link"
import { NetworkScreenSkeleton } from "@/components/skeletons/NetworkScreenSkeleton"
import type { MLMRank } from "@/api/mlm/schemas"

export function NetworkScreen() {
  const { t } = useTranslation("referrals.referrals")
  const navigate = useNavigate()

  // Fetch data from API
  const {
    data: mlmProfile,
    isPending: mlmProfilePending,
    isError: mlmProfileError,
    error: mlmProfileErrorData,
    refetch: mlmProfileRefetch,
    isRefetching: mlmProfileRefetching,
  } = useMLMProfile()

  const {
    data: commissionsSummary,
    isPending: commissionsSummaryPending,
    isError: commissionsSummaryError,
    error: commissionsSummaryErrorData,
    refetch: commissionsSummaryRefetch,
    isRefetching: commissionsSummaryRefetching,
  } = useCommissionsSummary()

  const {
    data: recentCommissionsData,
    isPending: recentCommissionsPending,
    isError: recentCommissionsError,
    error: recentCommissionsErrorData,
    refetch: recentCommissionsRefetch,
    isRefetching: recentCommissionsRefetching,
  } = useRecentCommissions(10)

  const {
    data: referralLink,
    isPending: referralLinkPending,
    isError: referralLinkError,
    error: referralLinkErrorData,
    refetch: referralLinkRefetch,
    isRefetching: referralLinkRefetching,
  } = useUserReferralLink()

  // Combined loading state
  const isPending =
    mlmProfilePending ||
    commissionsSummaryPending ||
    recentCommissionsPending ||
    referralLinkPending

  // Combined error state
  const hasError =
    mlmProfileError ||
    commissionsSummaryError ||
    recentCommissionsError ||
    referralLinkError

  // Refetch all data
  const onRefresh = async () => {
    await Promise.all([
      mlmProfileRefetch(),
      commissionsSummaryRefetch(),
      recentCommissionsRefetch(),
      referralLinkRefetch(),
    ])
  }

  // Refetching state
  const isRefetching =
    mlmProfileRefetching ||
    commissionsSummaryRefetching ||
    recentCommissionsRefetching ||
    referralLinkRefetching

  const handleAvatarPress = () => {
    navigate("/profile")
  }

  const handleNotificationPress = () => {
    navigate("/notifications")
  }

  const handleCommissionPress = (id: string) => {
    console.log(`Commission ${id} pressed - show details`)
  }

  // Loading state
  if (isPending) {
    return <NetworkScreenSkeleton />
  }

  // Error state
  if (hasError) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950">
        <Header
          userName={t("screen.error")}
          notificationCount={0}
          onAvatarPress={handleAvatarPress}
          onNotificationPress={handleNotificationPress}
        />
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
          <p className="text-red-500 text-lg font-bold mb-2">
            {t("screen.errorLoading")}
          </p>
          <p className="text-zinc-400 text-center">
            {(mlmProfileErrorData as any)?.message ||
              (commissionsSummaryErrorData as any)?.message ||
              (recentCommissionsErrorData as any)?.message ||
              (referralLinkErrorData as any)?.message ||
              t("screen.unknownError")}
          </p>
          <button
            onClick={() => onRefresh()}
            className="text-purple-500 mt-4 font-semibold hover:text-purple-400"
          >
            {t("screen.tryAgain")}
          </button>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  // Get data with fallbacks
  const userData = mlmProfile?.user
  const networkData = mlmProfile?.network
  const nextRankData = mlmProfile?.nextRankPreview
  const commissionsData = commissionsSummary
  const recentCommissions = recentCommissionsData?.commissions || []

  // Map commission data to component format
  const mappedCommissions = recentCommissions.map((commission: any) => ({
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
  const progressToNext = nextRankData
    ? {
        directs: {
          current: nextRankData.requirements.directs.actual,
          required: nextRankData.requirements.directs.required,
        },
        blockedBalance: {
          current: nextRankData.requirements.blockedBalance.actual,
          required: nextRankData.requirements.blockedBalance.required,
        },
        lifetimeVolume: {
          current: nextRankData.requirements.lifetimeVolume.actual,
          required: nextRankData.requirements.lifetimeVolume.required,
        },
      }
    : undefined

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header */}
      <Header
        userName={userData?.name || t("screen.user")}
        notificationCount={0}
        onAvatarPress={handleAvatarPress}
        onNotificationPress={handleNotificationPress}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Refetch Button (web alternative to pull-to-refresh) */}
        {isRefetching && (
          <div className="mx-6 mt-4 bg-violet-500/10 px-4 py-2 rounded-lg border border-violet-500/30 text-center">
            <span className="text-violet-400 text-sm font-medium">
              {t("screen.loadingData")}
            </span>
          </div>
        )}

        {/* Rank Card */}
        {userData && networkData && (
          <RankCard
            currentRank={userData.currentRank}
            rankStatus={userData.rankStatus}
            blockedBalance={userData.blockedBalance}
            lifetimeVolume={networkData.lifetimeVolume}
            nextRank={nextRankData?.rank}
            progressToNext={progressToNext}
          />
        )}

        {/* Referral Code */}
        {referralLink && (
          <ReferralCode
            referralCode={referralLink.referralCode}
            referralLink={referralLink.referralLink}
          />
        )}

        {/* Network Stats */}
        {networkData && userData && (
          <NetworkStats
            totalDirects={networkData.totalDirects}
            activeDirects={networkData.activeDirects}
            monthlyVolume={networkData.monthlyVolume}
            currentRank={userData.currentRank}
          />
        )}

        {/* Commission Overview */}
        {commissionsData && (
          <CommissionOverview
            today={commissionsData.today}
            thisMonth={commissionsData.thisMonth}
            total={commissionsData.total}
            byLevel={commissionsData.byLevel}
          />
        )}

        {/* Recent Commissions */}
        <RecentCommissions
          commissions={mappedCommissions}
          maxItems={10}
          onCommissionPress={handleCommissionPress}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
