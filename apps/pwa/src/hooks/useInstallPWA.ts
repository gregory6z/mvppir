import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function useInstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault()

      // Save the event for later use
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      // Clear the install prompt after installation
      setInstallPrompt(null)
      setIsInstallable(false)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const installPWA = async () => {
    if (!installPrompt) {
      return
    }

    // Show the install prompt
    await installPrompt.prompt()

    // Wait for the user's response
    await installPrompt.userChoice

    // Clear the prompt after use
    setInstallPrompt(null)
    setIsInstallable(false)
  }

  return {
    isInstallable,
    installPWA,
  }
}
