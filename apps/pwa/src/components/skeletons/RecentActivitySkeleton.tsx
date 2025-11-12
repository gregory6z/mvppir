export function RecentActivitySkeleton() {
  return (
    <div className="mx-6 mt-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-36 bg-zinc-800 rounded-full animate-pulse" />
        <div className="h-3 w-20 bg-zinc-800 rounded-full animate-pulse" />
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="w-full bg-zinc-900/80 backdrop-blur-xl p-4 rounded-2xl border border-zinc-800"
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-zinc-800 animate-pulse" />

              {/* Transaction Info */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-24 bg-zinc-800 rounded-full animate-pulse" />
                  <div className="h-3 w-16 bg-zinc-800 rounded-full animate-pulse" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-3 w-32 bg-zinc-800 rounded-full animate-pulse" />
                  <div className="h-3 w-20 bg-zinc-800 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
