import { HeaderSkeleton } from "@/components/skeletons/HeaderSkeleton"
import { BottomNavigation } from "@/components/navigation/BottomNavigation"

export function ProfileScreenSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header Skeleton */}
      <HeaderSkeleton />

      {/* Title Section Skeleton */}
      <div className="px-6 py-6 border-b border-zinc-800">
        <div className="h-7 w-32 bg-zinc-800 rounded-full animate-pulse mb-2" />
        <div className="h-4 w-48 bg-zinc-800 rounded-full animate-pulse" />
      </div>

      {/* Content (no scroll) */}
      <div className="flex-1 pb-24">
        {/* User Info Card Skeleton */}
        <div className="mx-6 mt-6 bg-gradient-to-br from-violet-500/20 to-blue-500/20 p-4 rounded-2xl border border-violet-500/30">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-zinc-800 animate-pulse mr-3" />
            <div className="flex-1">
              <div className="h-5 w-32 bg-zinc-800 rounded-full animate-pulse mb-2" />
              <div className="h-4 w-40 bg-zinc-800 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Account Information Skeleton */}
        <div className="mx-6 mt-6 bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
          <div className="h-4 w-36 bg-zinc-800 rounded-full animate-pulse mb-4" />

          <div className="space-y-0">
            {[1, 2].map((i) => (
              <div key={i} className="py-3 border-b border-zinc-800 last:border-b-0">
                <div className="h-3 w-16 bg-zinc-800 rounded-full animate-pulse mb-2" />
                <div className="h-4 w-full bg-zinc-800 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Language Settings Skeleton */}
        <div className="mx-6 mt-6 bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center mb-4">
            <div className="w-5 h-5 rounded-full bg-zinc-800 animate-pulse" />
            <div className="h-4 w-20 bg-zinc-800 rounded-full animate-pulse ml-2" />
          </div>

          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="w-full py-3.5 px-4 rounded-xl bg-zinc-800 animate-pulse"
              >
                <div className="h-4 w-24" />
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
