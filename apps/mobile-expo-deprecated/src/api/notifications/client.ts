/**
 * Notifications API Client
 *
 * Service functions for notifications endpoints.
 */

import { apiClient } from "@/lib/api-client";

interface RegisterPushTokenInput {
  expoPushToken: string;
  deviceInfo?: {
    deviceName?: string;
    osName?: string;
    osVersion?: string;
    appVersion?: string;
  };
}

interface RegisterPushTokenResponse {
  success: boolean;
  message: string;
  tokenId?: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  createdAt: string;
}

interface UnreadNotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Register Expo Push Token with backend
 */
export async function registerPushToken(
  input: RegisterPushTokenInput
): Promise<RegisterPushTokenResponse> {
  return apiClient.post("notifications/register-token", { json: input }).json<RegisterPushTokenResponse>();
}

/**
 * Get unread notifications
 */
export async function getUnreadNotifications(): Promise<UnreadNotificationsResponse> {
  return apiClient.get("notifications/unread").json<UnreadNotificationsResponse>();
}

/**
 * Mark notification as read (TODO: add endpoint in backend)
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await apiClient.patch(`notifications/${notificationId}/read`);
}
