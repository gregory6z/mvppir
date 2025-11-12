/**
 * Notifications API Client
 *
 * Service functions for notifications endpoints.
 */

import { apiClient } from "@/lib/api-client"

export interface Notification {
  id: string
  type: string
  title: string
  body: string
  data?: Record<string, any>
  createdAt: string
}

export interface UnreadNotificationsResponse {
  notifications: Notification[]
  unreadCount: number
}

/**
 * Get unread notifications
 */
export async function getUnreadNotifications(): Promise<UnreadNotificationsResponse> {
  return apiClient.get("notifications/unread").json<UnreadNotificationsResponse>()
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await apiClient.patch(`notifications/${notificationId}/read`)
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.patch("notifications/read-all")
}
