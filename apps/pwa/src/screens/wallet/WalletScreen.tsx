import { useMemo, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { format, isToday, isYesterday } from "date-fns"
import { useTranslation } from "react-i18next"
import { getDateFnsLocale } from "@/lib/utils"
import { ArrowLeft } from "phosphor-react"
import { RefreshCw } from "lucide-react"
import { useInfiniteUnifiedTransactions } from "@/api/user/queries/use-infinite-unified-transactions"
import { useUIStore } from "@/stores/ui.store"
import { TransactionItem } from "@/components/wallet/TransactionItem"
import { BottomNavigation } from "@/components/navigation/BottomNavigation"
import { WalletScreenSkeleton } from "@/components/skeletons/WalletScreenSkeleton"
import type { UnifiedTransaction } from "@/api/user/schemas"

type TransactionWithDate = UnifiedTransaction & {
  dateLabel?: string
  showDateHeader?: boolean
}

export function WalletScreen() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation("wallet.wallet")
  const {
    data,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteUnifiedTransactions()
  const { isBalanceVisible } = useUIStore()
  const observerTarget = useRef<HTMLDivElement>(null)

  const handleBack = () => {
    navigate(-1)
  }

  const handleTransactionPress = (id: string) => {
    const allTransactions = data?.pages.flatMap((page) => page.transactions) || []
    const transaction = allTransactions.find((tx) => tx.id === id)
    navigate(`/transactions/${id}`, { state: { transaction } })
  }

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  // Set up intersection observer for infinite scroll
  const observerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isPending) return
      if (observerTarget.current) observerTarget.current = node

      const observer = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: "20px",
        threshold: 1.0,
      })

      if (node) observer.observe(node)

      return () => {
        if (node) observer.unobserve(node)
      }
    },
    [handleObserver, isPending]
  )

  // Flatten all pages and add date headers
  const transactionsWithHeaders = useMemo(() => {
    if (!data?.pages) return []

    const allTransactions = data.pages.flatMap((page) => page.transactions)
    const withHeaders: TransactionWithDate[] = []
    let lastDateLabel = ""

    allTransactions.forEach((tx) => {
      const date = new Date(tx.createdAt)
      let dateLabel: string

      const locale = getDateFnsLocale(i18n.language)

      if (isToday(date)) {
        dateLabel = t("dateLabels.today")
      } else if (isYesterday(date)) {
        dateLabel = t("dateLabels.yesterday")
      } else {
        dateLabel = format(date, "d 'de' MMMM", { locale })
      }

      // Add date header if this is a new date
      if (dateLabel !== lastDateLabel) {
        withHeaders.push({
          ...tx,
          dateLabel,
          showDateHeader: true,
        })
        lastDateLabel = dateLabel
      } else {
        withHeaders.push({
          ...tx,
          showDateHeader: false,
        })
      }
    })

    return withHeaders
  }, [data, t, i18n.language])

  const totalCount = data?.pages[0]?.pagination.total || 0

  const handleRefresh = () => {
    refetch()
  }

  if (isPending) {
    return <WalletScreenSkeleton />
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 backdrop-blur-lg border-b border-zinc-800/50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
          >
            <ArrowLeft size={20} color="#fff" weight="bold" />
          </button>
          <h1 className="text-white text-lg font-bold">{t("title")}</h1>
          <button
            onClick={handleRefresh}
            disabled={isRefetching}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors disabled:opacity-50"
            aria-label="Refresh transactions"
          >
            <RefreshCw
              size={18}
              className={`text-white ${isRefetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Subtitle */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-zinc-400 text-sm">
            {t("subtitle", { count: totalCount })}
          </p>
        </div>

        {/* Transactions List */}
        {transactionsWithHeaders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <p className="text-zinc-500 text-base">{t("empty.title")}</p>
            <p className="text-zinc-600 text-sm mt-2">{t("empty.subtitle")}</p>
          </div>
        ) : (
          <div>
            {transactionsWithHeaders.map((item, index) => (
              <div key={`${item.id}-${index}`}>
                {item.showDateHeader && (
                  <div className="bg-zinc-950 px-6 py-2">
                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                      {item.dateLabel}
                    </p>
                  </div>
                )}
                <div className="px-6">
                  <TransactionItem
                    transaction={item}
                    isBalanceVisible={isBalanceVisible}
                    onPress={() => handleTransactionPress(item.id)}
                  />
                </div>
              </div>
            ))}

            {/* Infinite Scroll Trigger */}
            {hasNextPage && (
              <div ref={observerRef} className="py-4 flex justify-center">
                {isFetchingNextPage && (
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
