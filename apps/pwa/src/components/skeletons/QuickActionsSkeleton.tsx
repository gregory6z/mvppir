export function QuickActionsSkeleton() {
  return (
    <div className="mx-6 mt-6 max-w-7xl">
      {/* Title */}
      <div className="h-4 w-32 bg-zinc-800 rounded-full mb-4 animate-pulse" />

      {/* Actions Grid */}
      <div className="flex flex-col gap-3">
        {/* First Row */}
        <div className="flex gap-3">
          <div className="flex-1 bg-zinc-900/80 backdrop-blur-xl min-h-[52px] rounded-2xl border border-zinc-800 animate-pulse" />
          <div className="flex-1 bg-zinc-900/80 backdrop-blur-xl min-h-[52px] rounded-2xl border border-zinc-800 animate-pulse" />
        </div>

        {/* Second Row */}
        <div className="bg-zinc-900/80 backdrop-blur-xl min-h-[52px] rounded-2xl border border-zinc-800 animate-pulse" />
      </div>
    </div>
  )
}
