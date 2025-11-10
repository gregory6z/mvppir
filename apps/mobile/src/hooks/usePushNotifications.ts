/**
 * Push Notifications Hook
 *
 * React hook to setup and manage push notifications in the app.
 * Call this in App.tsx after user is authenticated.
 */

import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import {
  setupPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  setBadgeCount,
} from '@/services/pushNotifications';

interface UsePushNotificationsOptions {
  enabled?: boolean; // Only setup if user is authenticated
  onNotificationReceived?: (notification: Notifications.Notification) => void;
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void;
}

export function usePushNotifications(options: UsePushNotificationsOptions = {}) {
  const { enabled = true, onNotificationReceived, onNotificationTapped } = options;

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notificationListener = useRef<ReturnType<typeof Notifications.addNotificationReceivedListener> | null>(null);
  const responseListener = useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Setup push notifications
    setupPushNotifications()
      .then((success) => {
        if (success) {
          setIsReady(true);
          console.log('✅ Push notifications ready');
        } else {
          setError('Failed to setup push notifications');
          console.warn('⚠️ Push notifications not available');
        }
      })
      .catch((err) => {
        setError(err.message || 'Unknown error');
        console.error('❌ Push notifications error:', err);
      });

    // Listen for notifications received while app is in foreground
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('📬 Notification received:', notification);

      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Listen for notification taps (user tapped notification)
    responseListener.current = addNotificationResponseReceivedListener((response) => {
      console.log('👆 Notification tapped:', response);

      // Clear badge when user interacts with notification
      setBadgeCount(0);

      if (onNotificationTapped) {
        onNotificationTapped(response);
      }
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [enabled, onNotificationReceived, onNotificationTapped]);

  return {
    isReady,
    error,
  };
}
