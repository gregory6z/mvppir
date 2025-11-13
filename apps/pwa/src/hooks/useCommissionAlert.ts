import { useState, useEffect, useRef } from "react"
import { useUnreadNotifications } from "@/api/notifications/queries/use-unread-notifications"
import type { MLMRank } from "@/types/mlm"

interface CommissionData {
  amount: number
  tokenSymbol: string
  rank: MLMRank
  date: string
}

const SHOWN_COMMISSIONS_KEY = "shown_commission_alerts"

/**
 * Hook para detectar novas notificações de comissão diária e exibir drawer automaticamente
 */
export function useCommissionAlert() {
  const { data: notifications } = useUnreadNotifications()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null)
  const shownIdsRef = useRef<Set<string>>(new Set())

  // Load shown commission IDs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SHOWN_COMMISSIONS_KEY)
      if (stored) {
        shownIdsRef.current = new Set(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Failed to load shown commissions from localStorage:", error)
    }
  }, [])

  // Check for new commission notifications
  useEffect(() => {
    if (!notifications?.notifications) return

    // Filter for DAILY_COMMISSION notifications
    const commissionNotifications = notifications.notifications.filter(
      (n) => n.type === "DAILY_COMMISSION"
    )

    if (commissionNotifications.length === 0) return

    // Find the most recent commission that hasn't been shown yet
    const newCommission = commissionNotifications.find(
      (n) => !shownIdsRef.current.has(n.id)
    )

    if (!newCommission || !newCommission.data) return

    // Extract commission data from notification
    const data: CommissionData = {
      amount: newCommission.data.amount || 0,
      tokenSymbol: newCommission.data.tokenSymbol || "USDC",
      rank: (newCommission.data.rank as MLMRank) || "RECRUIT",
      date: newCommission.data.date || new Date().toISOString(),
    }

    // Show the drawer
    setCommissionData(data)
    setIsDrawerOpen(true)

    // Mark as shown
    shownIdsRef.current.add(newCommission.id)

    // Persist to localStorage
    try {
      localStorage.setItem(
        SHOWN_COMMISSIONS_KEY,
        JSON.stringify(Array.from(shownIdsRef.current))
      )
    } catch (error) {
      console.error("Failed to save shown commissions to localStorage:", error)
    }
  }, [notifications])

  const closeDrawer = () => {
    setIsDrawerOpen(false)
  }

  return {
    isDrawerOpen,
    commissionData,
    closeDrawer,
  }
}
