import { HeaderSkeleton } from "@/components/skeletons/HeaderSkeleton"
import { BottomNavigation } from "@/components/navigation/BottomNavigation"

export function NetworkScreenSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header Skeleton */}
      <HeaderSkeleton />

      {/* Content with scroll */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Rank Card Skeleton */}
        <div className="mx-6 mt-6 bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 animate-pulse" />
                <div>
                  <div className="h-6 w-24 bg-zinc-800 rounded-full animate-pulse mb-2" />
                  <div className="h-4 w-32 bg-zinc-800 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-16 bg-zinc-800 rounded-full animate-pulse" />
            </div>
            {/* How It Works Button */}
            <div className="h-10 w-full bg-violet-500/10 rounded-xl animate-pulse border border-violet-500/20" />
          </div>

          {/* Progress bars */}
          <div className="space-y-3">
            <div className="h-2 w-full bg-zinc-800 rounded-full animate-pulse" />
            <div className="h-2 w-full bg-zinc-800 rounded-full animate-pulse" />
            <div className="h-2 w-full bg-zinc-800 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Referral Code Skeleton */}
        <div className="mx-6 mt-6">
          <div className="h-5 w-40 bg-zinc-800 rounded-full animate-pulse mb-4" />
          <div className="bg-gradient-to-br from-violet-500/20 to-blue-500/20 p-6 rounded-3xl border border-violet-500/30 mb-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-32 bg-zinc-800 rounded-full animate-pulse" />
            </div>
            <div className="bg-zinc-900 p-4 rounded-2xl mb-4">
              <div className="h-3 w-28 bg-zinc-800 rounded-full animate-pulse mx-auto mb-1" />
              <div className="h-9 w-40 bg-zinc-800 rounded-full animate-pulse mx-auto" />
            </div>
            {/* Buttons */}
            <div className="flex gap-2">
              <div className="flex-1 h-12 bg-violet-500/30 rounded-xl animate-pulse" />
              <div className="w-12 h-12 bg-zinc-800 rounded-xl animate-pulse" />
            </div>
          </div>
          {/* Info box */}
          <div className="h-12 bg-blue-500/10 rounded-xl border border-blue-500/20 animate-pulse" />
        </div>

        {/* Network Stats Skeleton */}
        <div className="mx-6 mt-6">
          <div className="h-5 w-36 bg-zinc-800 rounded-full animate-pulse mb-3" />
          {/* Monthly Maintenance Button */}
          <div className="h-10 w-full bg-orange-500/10 rounded-xl mb-4 border border-orange-500/20 animate-pulse" />

          {/* Summary Cards */}
          <div className="space-y-3 mb-4">
            {/* Top Row - 2 Cards */}
            <div className="flex gap-3">
              <div className="flex-1 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg animate-pulse" />
                  <div className="h-3 w-20 bg-zinc-800 rounded-full animate-pulse" />
                </div>
                <div className="h-7 w-12 bg-zinc-800 rounded-full animate-pulse mb-1" />
                <div className="h-3 w-16 bg-zinc-800 rounded-full animate-pulse" />
              </div>
              <div className="flex-1 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg animate-pulse" />
                  <div className="h-3 w-20 bg-zinc-800 rounded-full animate-pulse" />
                </div>
                <div className="h-7 w-12 bg-zinc-800 rounded-full animate-pulse mb-1" />
                <div className="h-3 w-16 bg-zinc-800 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Network Volume - Full Width */}
            <div className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 p-4 rounded-2xl border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl animate-pulse" />
                  <div>
                    <div className="h-3 w-24 bg-zinc-800 rounded-full animate-pulse mb-2" />
                    <div className="h-7 w-20 bg-zinc-800 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-zinc-800 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Commission Overview Skeleton */}
        <div className="mx-6 mt-6">
          <div className="h-5 w-44 bg-zinc-800 rounded-full animate-pulse mb-4" />

          {/* Summary Card */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 mb-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex items-center justify-between ${i < 3 ? "mb-4 pb-4 border-b border-zinc-800" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl animate-pulse" />
                  <div>
                    <div className="h-3 w-16 bg-zinc-800 rounded-full animate-pulse mb-1" />
                    <div className="h-6 w-24 bg-zinc-800 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-zinc-800 rounded-full animate-pulse" />
              </div>
            ))}
          </div>

          {/* Daily Average Card */}
          <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 p-5 rounded-2xl border border-violet-500/30 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-3 w-24 bg-zinc-800 rounded-full animate-pulse mb-2" />
                <div className="h-7 w-20 bg-zinc-800 rounded-full animate-pulse" />
              </div>
              <div className="text-right">
                <div className="h-3 w-20 bg-zinc-800 rounded-full animate-pulse mb-2 ml-auto" />
                <div className="h-5 w-16 bg-zinc-800 rounded-full animate-pulse ml-auto" />
              </div>
            </div>
          </div>

          {/* By Level Card */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-zinc-800 rounded animate-pulse" />
              <div className="h-5 w-32 bg-zinc-800 rounded-full animate-pulse" />
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-3 ${i < 3 ? "border-b border-zinc-800" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg animate-pulse" />
                  <div className="h-4 w-24 bg-zinc-800 rounded-full animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-zinc-800 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Commissions Skeleton */}
        <div className="mx-6 mt-6 mb-6">
          <div className="h-5 w-48 bg-zinc-800 rounded-full animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-zinc-800 rounded-full animate-pulse mb-2" />
                    <div className="h-3 w-24 bg-zinc-800 rounded-full animate-pulse" />
                  </div>
                  <div className="h-5 w-20 bg-zinc-800 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
