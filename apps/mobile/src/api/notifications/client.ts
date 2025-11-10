/**
 * Notifications API Client
 *
 * Service functions for notifications endpoints.
 */

import { api } from "../client";

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
  const response = await api.post("/notifications/register-token", input);
  return response.data;
}

/**
 * Get unread notifications
 */
export async function getUnreadNotifications(): Promise<UnreadNotificationsResponse> {
  const response = await api.get("/notifications/unread");
  return response.data;
}

/**
 * Mark notification as read (TODO: add endpoint in backend)
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await api.patch(`/notifications/${notificationId}/read`);
}
