export function HeaderSkeleton() {
  return (
    <div className="sticky top-0 bg-zinc-950 px-6 py-4 z-40 border-b border-zinc-900">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Avatar + Greeting Skeleton */}
        <div className="flex items-center gap-3">
          {/* Avatar Circle */}
          <div className="w-12 h-12 rounded-full bg-zinc-800 animate-pulse" />

          {/* Text Skeleton */}
          <div className="space-y-2">
            <div className="h-3 w-20 bg-zinc-800 rounded-full animate-pulse" />
            <div className="h-4 w-32 bg-zinc-800 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Notification Bell Skeleton */}
        <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
      </div>
    </div>
  )
}
