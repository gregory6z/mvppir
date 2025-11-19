import { useState, useEffect, useRef } from "react"
import { useUnreadNotifications } from "@/api/notifications/queries/use-unread-notifications"
import type { Notification } from "@/api/notifications/client"
import type { MLMRank } from "@/types/mlm"

interface RankAchievementData {
  type: "upgrade" | "downgrade"
  newRank: MLMRank
  previousRank: MLMRank
  changedAt: string
}

const SHOWN_RANK_ACHIEVEMENTS_KEY = "shown_rank_achievement_alerts"

/**
 * Hook to detect new rank achievement notifications and display drawer automatically
 */
export function useRankAchievementAlert() {
  const { data: notifications } = useUnreadNotifications()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [rankAchievementData, setRankAchievementData] = useState<RankAchievementData | null>(null)
  const shownIdsRef = useRef<Set<string>>(new Set())

  // Load shown rank achievement IDs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SHOWN_RANK_ACHIEVEMENTS_KEY)
      if (stored) {
        shownIdsRef.current = new Set(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Failed to load shown rank achievements from localStorage:", error)
    }
  }, [])

  // Check for new rank change notifications (upgrade or downgrade)
  useEffect(() => {
    if (!notifications?.notifications) return

    // Filter for RANK_UPGRADE and RANK_DOWNGRADE notifications
    const rankNotifications = notifications.notifications.filter(
      (n: Notification) => n.type === "RANK_UPGRADE" || n.type === "RANK_DOWNGRADE"
    )

    if (rankNotifications.length === 0) return

    // Find the most recent rank change that hasn't been shown yet
    const newRankChange = rankNotifications.find(
      (n: Notification) => !shownIdsRef.current.has(n.id)
    )

    if (!newRankChange || !newRankChange.data) return

    // Extract rank change data from notification
    const data: RankAchievementData = {
      type: newRankChange.type === "RANK_UPGRADE" ? "upgrade" : "downgrade",
      newRank: (newRankChange.data.newRank as MLMRank) || "RECRUIT",
      previousRank: (newRankChange.data.previousRank as MLMRank) || "RECRUIT",
      changedAt: newRankChange.data.changedAt || new Date().toISOString(),
    }

    // Show the drawer
    setRankAchievementData(data)
    setIsDrawerOpen(true)

    // Mark as shown
    shownIdsRef.current.add(newRankChange.id)

    // Persist to localStorage
    try {
      localStorage.setItem(
        SHOWN_RANK_ACHIEVEMENTS_KEY,
        JSON.stringify(Array.from(shownIdsRef.current))
      )
    } catch (error) {
      console.error("Failed to save shown rank achievements to localStorage:", error)
    }
  }, [notifications])

  const closeDrawer = () => {
    setIsDrawerOpen(false)
  }

  return {
    isDrawerOpen,
    rankAchievementData,
    closeDrawer,
  }
}
