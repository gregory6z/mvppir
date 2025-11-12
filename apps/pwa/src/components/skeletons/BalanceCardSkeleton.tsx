export function BalanceCardSkeleton() {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-xl mx-6 mt-6 rounded-3xl p-6 border border-zinc-800 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 w-24 bg-zinc-800 rounded-full animate-pulse" />
        <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
      </div>

      {/* Balance Amount */}
      <div className="mb-3">
        <div className="h-10 w-48 bg-zinc-800 rounded-2xl animate-pulse" />
      </div>

      {/* Percent Change Indicator */}
      <div className="flex items-center gap-2 bg-zinc-800/50 self-start px-3 py-2 rounded-full w-32">
        <div className="h-4 w-4 bg-zinc-700 rounded-full animate-pulse" />
        <div className="h-3 w-16 bg-zinc-700 rounded-full animate-pulse" />
      </div>
    </div>
  )
}
