import { HeaderSkeleton } from "@/components/skeletons/HeaderSkeleton"
import { BottomNavigation } from "@/components/navigation/BottomNavigation"

export function WalletScreenSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header Skeleton */}
      <HeaderSkeleton />

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Title Section */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-7 w-40 bg-zinc-800 rounded-full animate-pulse mb-2" />
              <div className="h-4 w-32 bg-zinc-800 rounded-full animate-pulse" />
            </div>
            <div className="w-9 h-9 bg-zinc-800 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Date Header */}
        <div className="px-6 py-2">
          <div className="h-3 w-16 bg-zinc-800 rounded-full animate-pulse" />
        </div>

        {/* Transaction Items */}
        <div className="px-6 space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="w-full bg-zinc-900 p-4 rounded-2xl border border-zinc-800"
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-zinc-800 animate-pulse" />

                {/* Transaction Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-32 bg-zinc-800 rounded-full animate-pulse" />
                    <div className="h-4 w-20 bg-zinc-800 rounded-full animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 bg-zinc-800 rounded-full animate-pulse" />
                    <div className="h-5 w-20 bg-zinc-800 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
