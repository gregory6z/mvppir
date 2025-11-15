import { useState, useEffect } from "react"
import { usePWAInstallStatus } from "./usePWAInstallStatus"
import { useBrowserDetection } from "./useBrowserDetection"

const DISMISSED_KEY = "ios-install-prompt-dismissed"
const DISMISSED_COUNT_KEY = "ios-install-prompt-dismissed-count"
const MAX_DISMISSALS = 3 // Show max 3 times before permanently hiding

export function useIOSInstallPrompt() {
  const { isIOS, isInstalled } = usePWAInstallStatus()
  const { isSafari } = useBrowserDetection()
  const [showPrompt, setShowPrompt] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    // Don't show if:
    // 1. Not iOS
    // 2. Already installed
    // 3. User dismissed too many times
    if (!isIOS || isInstalled) {
      return
    }

    // Check dismissal count
    const dismissedCount = parseInt(
      localStorage.getItem(DISMISSED_COUNT_KEY) || "0",
      10
    )

    if (dismissedCount >= MAX_DISMISSALS) {
      return
    }

    // Check if dismissed recently (within 24 hours)
    const dismissedAt = localStorage.getItem(DISMISSED_KEY)
    if (dismissedAt) {
      const dismissedTime = new Date(dismissedAt).getTime()
      const now = new Date().getTime()
      const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60)

      // Show again after 24 hours
      if (hoursSinceDismissed < 24) {
        return
      }
    }

    // Show prompt after 3 seconds (give user time to see the app)
    const timer = setTimeout(() => {
      setShowPrompt(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [isIOS, isInstalled])

  const dismissPrompt = () => {
    setShowPrompt(false)

    // Increment dismissal count
    const currentCount = parseInt(
      localStorage.getItem(DISMISSED_COUNT_KEY) || "0",
      10
    )
    localStorage.setItem(DISMISSED_COUNT_KEY, String(currentCount + 1))

    // Store dismissal timestamp
    localStorage.setItem(DISMISSED_KEY, new Date().toISOString())
  }

  const openInstructions = () => {
    setShowPrompt(false)
    setShowInstructions(true)
  }

  const closeInstructions = () => {
    setShowInstructions(false)
    dismissPrompt() // Mark as dismissed when closing instructions
  }

  return {
    showPrompt,
    showInstructions,
    dismissPrompt,
    openInstructions,
    closeInstructions,
    isIOS,
    isSafari,
  }
}
