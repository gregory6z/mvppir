/**
 * Unread Notifications Query
 *
 * Query hook to fetch unread notifications from backend.
 */

import { useQuery } from "@tanstack/react-query";
import { getUnreadNotifications } from "../client";

export function useUnreadNotifications() {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: getUnreadNotifications,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}
