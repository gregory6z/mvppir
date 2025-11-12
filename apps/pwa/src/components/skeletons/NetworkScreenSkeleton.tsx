import { HeaderSkeleton } from "@/components/skeletons/HeaderSkeleton"
import { BottomNavigation } from "@/components/navigation/BottomNavigation"

export function NetworkScreenSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header Skeleton */}
      <HeaderSkeleton />

      {/* Content (no scroll) */}
      <div className="flex-1 pb-24">
        {/* Rank Card Skeleton */}
        <div className="mx-6 mt-6 bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 animate-pulse" />
              <div>
                <div className="h-6 w-24 bg-zinc-800 rounded-full animate-pulse mb-2" />
                <div className="h-4 w-32 bg-zinc-800 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-16 bg-zinc-800 rounded-full animate-pulse" />
          </div>

          <div className="h-10 w-full bg-zinc-800/50 rounded-xl animate-pulse" />
        </div>

        {/* Referral Code Skeleton */}
        <div className="mx-6 mt-6">
          <div className="h-5 w-40 bg-zinc-800 rounded-full animate-pulse mb-4" />
          <div className="bg-gradient-to-br from-violet-500/20 to-blue-500/20 p-6 rounded-3xl border border-violet-500/30">
            <div className="bg-zinc-900 p-4 rounded-2xl mb-4">
              <div className="h-4 w-32 bg-zinc-800 rounded-full animate-pulse mx-auto mb-2" />
              <div className="h-8 w-40 bg-zinc-800 rounded-full animate-pulse mx-auto" />
            </div>
            <div className="h-12 w-full bg-zinc-800 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Network Stats Skeleton */}
        <div className="mx-6 mt-6">
          <div className="h-5 w-36 bg-zinc-800 rounded-full animate-pulse mb-3" />
          <div className="flex gap-3 mb-3">
            <div className="flex-1 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
              <div className="h-4 w-20 bg-zinc-800 rounded-full animate-pulse mb-2" />
              <div className="h-7 w-12 bg-zinc-800 rounded-full animate-pulse" />
            </div>
            <div className="flex-1 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
              <div className="h-4 w-20 bg-zinc-800 rounded-full animate-pulse mb-2" />
              <div className="h-7 w-12 bg-zinc-800 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Commission Overview Skeleton */}
        <div className="mx-6 mt-6">
          <div className="h-5 w-44 bg-zinc-800 rounded-full animate-pulse mb-4" />
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-4 ${i === 1 ? "border-b border-zinc-800" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl animate-pulse" />
                  <div>
                    <div className="h-3 w-16 bg-zinc-800 rounded-full animate-pulse mb-2" />
                    <div className="h-5 w-24 bg-zinc-800 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="h-5 w-16 bg-zinc-800 rounded-full animate-pulse" />
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
