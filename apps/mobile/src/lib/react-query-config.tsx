import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import type { AppStateStatus } from "react-native";
import { focusManager, onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

/**
 * Configure React Query para React Native
 * - Setup do focusManager para refetch quando app volta ao foco
 * - Setup do onlineManager para detectar estado online/offline
 */
export function useReactQueryConfig() {
  useEffect(() => {
    // Configure focus manager
    const onAppStateChange = (status: AppStateStatus) => {
      if (Platform.OS !== "web") {
        focusManager.setFocused(status === "active");
      }
    };

    const subscription = AppState.addEventListener("change", onAppStateChange);

    // Configure online manager
    const unsubscribe = NetInfo.addEventListener((state) => {
      onlineManager.setOnline(!!state.isConnected);
    });

    return () => {
      subscription.remove();
      unsubscribe();
    };
  }, []);
}
