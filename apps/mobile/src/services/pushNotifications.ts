/**
 * Push Notifications Service
 *
 * Handles Expo Push Notifications setup, permissions, and token registration.
 */

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from '@/api/client';

/**
 * Configure how notifications are handled when app is in foreground
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request permission and get Expo Push Token
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Only works on physical devices (not simulators/emulators)
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Permission denied
    if (finalStatus !== 'granted') {
      console.warn('Push notification permission not granted');
      return null;
    }

    // Get Expo Push Token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.error('EAS Project ID not found in app.config.ts');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    // Configure Android notification channel (required for Android 8+)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    return token.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Register push token with backend
 */
export async function registerPushTokenWithBackend(
  expoPushToken: string
): Promise<boolean> {
  try {
    const deviceInfo = {
      deviceName: Device.deviceName || 'Unknown',
      osName: Device.osName || Platform.OS,
      osVersion: Device.osVersion || 'Unknown',
      appVersion: Constants.expoConfig?.version || '1.0.0',
    };

    await api.post('/notifications/register-token', {
      expoPushToken,
      deviceInfo,
    });

    console.log('✅ Push token registered with backend');
    return true;
  } catch (error) {
    console.error('❌ Failed to register push token with backend:', error);
    return false;
  }
}

/**
 * Complete push notification setup (call on app startup after login)
 */
export async function setupPushNotifications(): Promise<boolean> {
  try {
    // 1. Get Expo Push Token
    const expoPushToken = await registerForPushNotifications();

    if (!expoPushToken) {
      return false;
    }

    // 2. Register with backend
    const registered = await registerPushTokenWithBackend(expoPushToken);

    return registered;
  } catch (error) {
    console.error('Error setting up push notifications:', error);
    return false;
  }
}

/**
 * Add notification received listener
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener (when user taps notification)
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Get badge count (iOS)
 */
export async function getBadgeCount(): Promise<number> {
  if (Platform.OS !== 'ios') return 0;
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count (iOS)
 */
export async function setBadgeCount(count: number): Promise<void> {
  if (Platform.OS !== 'ios') return;
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}
