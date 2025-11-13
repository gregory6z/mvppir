import { Bell } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useUnreadNotifications } from "@/api/notifications/queries/use-unread-notifications"

interface HeaderProps {
  userName: string
  avatarUrl?: string
  onAvatarPress: () => void
  onNotificationPress: () => void
}

export function Header({
  userName,
  onAvatarPress,
  onNotificationPress,
}: HeaderProps) {
  const { t } = useTranslation("common.greetings")
  const { data: notifications } = useUnreadNotifications()
  const notificationCount = notifications?.unreadCount || 0

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t("morning")
    if (hour < 18) return t("afternoon")
    return t("evening")
  }

  // Get initials from name
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="sticky top-0 bg-zinc-950 px-6 py-4 z-40 border-b border-zinc-900">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Avatar + Greeting */}
        <button
          onClick={onAvatarPress}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          aria-label="Profile"
        >
          {/* Avatar Circle with Initials */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-[#D445E7] to-cyan-400 flex items-center justify-center shadow-[0_4px_12px_rgba(157,131,231,0.4)]">
            <span className="text-white text-base font-semibold">
              {getInitials(userName)}
            </span>
          </div>

          {/* Greeting Text */}
          <div className="text-left">
            <p className="text-zinc-400 text-sm font-medium">
              {getGreeting()}
            </p>
            <p className="text-white text-base font-semibold">
              {userName}
            </p>
          </div>
        </button>

        {/* Notification Bell */}
        <button
          onClick={onNotificationPress}
          className="relative hover:opacity-80 transition-opacity p-2 -mr-2"
          aria-label="Notifications"
        >
          <Bell size={24} color="#ffffff" />
          {notificationCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              <span className="text-white text-xs font-bold">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
