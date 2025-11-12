import { BottomNavigation } from "../navigation/BottomNavigation"
import { HeaderSkeleton } from "./HeaderSkeleton"
import { BalanceCardSkeleton } from "./BalanceCardSkeleton"
import { QuickActionsSkeleton } from "./QuickActionsSkeleton"
import { RecentActivitySkeleton } from "./RecentActivitySkeleton"

export function HomeScreenSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header Skeleton */}
      <HeaderSkeleton />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Balance Card Skeleton */}
        <BalanceCardSkeleton />

        {/* Quick Actions Skeleton */}
        <QuickActionsSkeleton />

        {/* Recent Activity Skeleton */}
        <RecentActivitySkeleton />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
