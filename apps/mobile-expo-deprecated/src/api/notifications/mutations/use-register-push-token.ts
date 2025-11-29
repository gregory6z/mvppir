/**
 * Register Push Token Mutation
 *
 * Mutation hook to register Expo Push Token with backend.
 */

import { useMutation } from "@tanstack/react-query";
import { registerPushToken } from "../client";

export function useRegisterPushToken() {
  return useMutation({
    mutationFn: registerPushToken,
    onSuccess: () => {
      console.log("✅ Push token registered successfully");
    },
    onError: (error) => {
      console.error("❌ Failed to register push token:", error);
    },
  });
}
