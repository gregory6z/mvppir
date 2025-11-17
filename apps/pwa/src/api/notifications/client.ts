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
  nextCursor: string | null
  hasMore: boolean
}

/**
 * Get unread notifications with cursor-based pagination
 */
export async function getUnreadNotifications(params?: {
  cursor?: string
  limit?: number
}): Promise<UnreadNotificationsResponse> {
  const searchParams = new URLSearchParams()

  if (params?.cursor) {
    searchParams.append("cursor", params.cursor)
  }

  if (params?.limit) {
    searchParams.append("limit", params.limit.toString())
  }

  const url = searchParams.toString()
    ? `notifications/unread?${searchParams.toString()}`
    : "notifications/unread"

  return apiClient.get(url).json<UnreadNotificationsResponse>()
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
