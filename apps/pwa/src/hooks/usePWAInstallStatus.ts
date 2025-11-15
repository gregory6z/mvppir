import { useEffect, useState } from "react"

interface PWAInstallStatus {
  isInstalled: boolean
  isIOS: boolean
  isAndroid: boolean
  installedAt: string | null
  isFirstLaunch: boolean
  displayMode: "browser" | "standalone" | "fullscreen" | "minimal-ui"
}

export function usePWAInstallStatus(): PWAInstallStatus {
  const [status, setStatus] = useState<PWAInstallStatus>(() => {
    // Detect if running in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)

    // Get display mode
    let displayMode: PWAInstallStatus["displayMode"] = "browser"
    if (window.matchMedia("(display-mode: standalone)").matches) {
      displayMode = "standalone"
    } else if (window.matchMedia("(display-mode: fullscreen)").matches) {
      displayMode = "fullscreen"
    } else if (window.matchMedia("(display-mode: minimal-ui)").matches) {
      displayMode = "minimal-ui"
    }

    // Check if this is first launch after installation
    const installedAt = localStorage.getItem("pwa-installed-at")
    const isFirstLaunch = isStandalone && !installedAt

    // Save installation timestamp on first standalone launch
    if (isFirstLaunch) {
      const timestamp = new Date().toISOString()
      localStorage.setItem("pwa-installed-at", timestamp)
      localStorage.setItem("pwa-first-launch", "true")
    }

    return {
      isInstalled: isStandalone,
      isIOS,
      isAndroid,
      installedAt,
      isFirstLaunch,
      displayMode,
    }
  })

  useEffect(() => {
    // Listen for display mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)")

    const handleChange = () => {
      const isStandalone =
        mediaQuery.matches || (window.navigator as any).standalone === true

      setStatus((prev) => ({
        ...prev,
        isInstalled: isStandalone,
        displayMode: mediaQuery.matches ? "standalone" : "browser",
      }))
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  return status
}
