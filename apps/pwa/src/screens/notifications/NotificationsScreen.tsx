import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useEffect, useRef } from "react"
import {
  ArrowLeft,
  Bell,
  BellSlash,
  CheckCircle,
  CurrencyCircleDollar,
  ArrowCircleUp,
  Trophy,
  Users,
  MegaphoneSimple,
  CircleNotch,
} from "phosphor-react"
import { useInfiniteNotifications } from "@/api/notifications/queries/use-infinite-notifications"
import { useMarkAsRead } from "@/api/notifications/mutations/use-mark-as-read"
import { useMarkAllAsRead } from "@/api/notifications/mutations/use-mark-all-as-read"
import { formatDistanceToNow } from "date-fns"
import { getDateFnsLocale } from "@/lib/utils"

export function NotificationsScreen() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation("notifications.notifications")
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteNotifications()
  const { mutate: markAsRead } = useMarkAsRead()
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead()

  const loadMoreRef = useRef<HTMLDivElement>(null)
  const locale = getDateFnsLocale(i18n.language)

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleBack = () => {
    navigate(-1)
  }

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const getNotificationIcon = (type: string) => {
    const iconProps = { size: 24, weight: "duotone" as const }

    switch (type) {
      case "deposit":
        return <CurrencyCircleDollar {...iconProps} color="#10b981" />
      case "withdrawal":
        return <ArrowCircleUp {...iconProps} color="#3b82f6" />
      case "commission":
        return <Trophy {...iconProps} color="#a855f7" />
      case "referral":
        return <Users {...iconProps} color="#f59e0b" />
      case "system":
        return <MegaphoneSimple {...iconProps} color="#71717a" />
      default:
        return <Bell {...iconProps} color="#8b5cf6" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "from-green-500/20 to-emerald-500/20 border-green-500/40"
      case "withdrawal":
        return "from-blue-500/20 to-cyan-500/20 border-blue-500/40"
      case "commission":
        return "from-purple-500/20 to-pink-500/20 border-purple-500/40"
      case "referral":
        return "from-orange-500/20 to-yellow-500/20 border-orange-500/40"
      case "system":
        return "from-zinc-500/20 to-zinc-600/20 border-zinc-500/40"
      default:
        return "from-violet-500/20 to-purple-500/20 border-violet-500/40"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true, locale })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
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
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Loading State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">{t("loading")}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
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
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Error State */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-red-400 text-base">{t("error")}</p>
          </div>
        </div>
      </div>
    )
  }

  // Flatten all pages into single array
  const notifications = data?.pages.flatMap((page) => page.notifications) || []
  const unreadCount = data?.pages[0]?.unreadCount || 0

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
          <div className="flex items-center gap-2">
            <h1 className="text-white text-lg font-bold">{t("title")}</h1>
            {unreadCount > 0 && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{unreadCount}</span>
              </div>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-500/20 hover:bg-violet-500/30 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={20} color="#8b5cf6" weight="bold" />
            </button>
          )}
          {unreadCount === 0 && <div className="w-10" />}
        </div>

        {unreadCount > 0 && (
          <div className="px-4 pb-3">
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              className="text-violet-400 text-sm font-semibold hover:text-violet-300 transition-colors disabled:opacity-50"
            >
              {t("markAllAsRead")}
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4">
        {notifications.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
            <div className="relative w-32 h-32 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/30 to-zinc-900/30 rounded-full blur-2xl" />
              <div className="relative w-32 h-32 bg-gradient-to-br from-zinc-800/20 to-zinc-900/20 rounded-full flex items-center justify-center border border-zinc-800/40">
                <BellSlash size={64} color="#52525b" weight="duotone" />
              </div>
            </div>

            <h2 className="text-white text-2xl font-black text-center mb-2">
              {t("empty.title")}
            </h2>
            <p className="text-zinc-400 text-center text-base">
              {t("empty.subtitle")}
            </p>
          </div>
        ) : (
          /* Notifications */
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                className={`group bg-gradient-to-br ${getNotificationColor(
                  notification.type
                )} border rounded-2xl p-4 shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-zinc-900/50 flex items-center justify-center flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-white font-bold text-base leading-tight">
                        {notification.title}
                      </h3>
                      <Bell size={16} color="#8b5cf6" weight="fill" />
                    </div>
                    <p className="text-zinc-300 text-sm leading-snug mb-2">
                      {notification.body}
                    </p>
                    <p className="text-zinc-500 text-xs">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Trigger */}
            {hasNextPage && (
              <div
                ref={loadMoreRef}
                className="flex items-center justify-center py-6"
              >
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 text-violet-400">
                    <CircleNotch size={20} weight="bold" className="animate-spin" />
                    <span className="text-sm font-semibold">{t("loadingMore")}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
