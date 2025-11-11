/**
 * useNotifications Hook
 *
 * Handles push notification setup, permissions, and listeners.
 * Automatically registers token on app startup for authenticated users.
 *
 * Uses:
 * - Expo Notifications (permissions, listeners, badge)
 * - React Query mutations (API calls via api/notifications/)
 */

import { useEffect, useRef, useState } from "react"
import * as Device from "expo-device"
import * as Notifications from "expo-notifications"
import type { Notification, NotificationResponse } from "expo-notifications"
import Constants from "expo-constants"
import { Platform } from "react-native"
import { useRegisterPushToken } from "@/api/notifications/mutations/use-register-push-token"

/**
 * Configure notification behavior when app is in foreground
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

interface UseNotificationsOptions {
  enabled?: boolean
  onNotificationReceived?: (notification: Notification) => void
  onNotificationTapped?: (response: NotificationResponse) => void
}

interface UseNotificationsReturn {
  isReady: boolean
  error: string | null
  permissionGranted: boolean
}

/**
 * Request notification permissions and get Expo Push Token
 */
async function getExpoPushToken(): Promise<string | null> {
  try {
    // Only works on physical devices
    if (!Device.isDevice) {
      console.warn("⚠️ Push notifications only work on physical devices")
      return null
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    // Request permission if not granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      console.warn("⚠️ Notification permission not granted")
      return null
    }

    // Get Expo Push Token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId

    if (!projectId) {
      console.error("❌ EAS Project ID not found in app config")
      return null
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId })

    // Configure Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Padrão",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#3b82f6",
        sound: "default",
      })
    }

    return tokenData.data
  } catch (error) {
    console.error("❌ Error getting push token:", error)
    return null
  }
}

/**
 * Get device info for backend registration
 */
function getDeviceInfo() {
  return {
    deviceName: Device.deviceName || "Unknown",
    osName: Device.osName || Platform.OS,
    osVersion: Device.osVersion || "Unknown",
    appVersion: Constants.expoConfig?.version || "1.0.0",
  }
}

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const {
    enabled = true,
    onNotificationReceived,
    onNotificationTapped,
  } = options

  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionGranted, setPermissionGranted] = useState(false)

  const notificationListener = useRef<ReturnType<
    typeof Notifications.addNotificationReceivedListener
  > | null>(null)
  const responseListener = useRef<ReturnType<
    typeof Notifications.addNotificationResponseReceivedListener
  > | null>(null)

  const registerToken = useRegisterPushToken()

  useEffect(() => {
    if (!enabled) {
      return
    }

    let isMounted = true

    async function setupNotifications() {
      try {
        // Step 1: Request permissions and get Expo Push Token
        const expoPushToken = await getExpoPushToken()

        if (!isMounted) return

        if (!expoPushToken) {
          setError("Failed to get push notification token")
          setPermissionGranted(false)
          return
        }

        setPermissionGranted(true)

        // Step 2: Register token with backend using React Query mutation
        registerToken.mutate(
          {
            expoPushToken,
            deviceInfo: getDeviceInfo(),
          },
          {
            onSuccess: () => {
              if (!isMounted) return
              setIsReady(true)
              console.log("✅ Push notifications ready")
            },
            onError: (err) => {
              if (!isMounted) return
              setError(err instanceof Error ? err.message : "Unknown error")
              console.error("❌ Failed to register push token:", err)
            },
          }
        )
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : "Unknown error")
        console.error("❌ Push notification setup failed:", err)
      }
    }

    setupNotifications()

    return () => {
      isMounted = false
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || !isReady) {
      return
    }

    // Listen for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📬 Notification received:", notification)

        if (onNotificationReceived) {
          onNotificationReceived(notification)
        }
      }
    )

    // Listen for notification taps (user tapped notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("👆 User tapped notification:", response)

        // Clear badge when user taps notification (iOS only)
        if (Platform.OS === "ios") {
          Notifications.setBadgeCountAsync(0)
        }

        if (onNotificationTapped) {
          onNotificationTapped(response)
        }
      }
    )

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove()
      }
      if (responseListener.current) {
        responseListener.current.remove()
      }
    }
  }, [enabled, isReady, onNotificationReceived, onNotificationTapped])

  return {
    isReady,
    error,
    permissionGranted,
  }
}
