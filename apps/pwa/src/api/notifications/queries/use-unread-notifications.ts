import { useQuery } from "@tanstack/react-query"
import { getUnreadNotifications, type UnreadNotificationsResponse } from "../client"

export function useUnreadNotifications() {
  return useQuery<UnreadNotificationsResponse>({
    queryKey: ["notifications", "unread"],
    queryFn: () => getUnreadNotifications(),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
    retry: 1, // Only retry once instead of infinite
    retryDelay: 3000, // Wait 3 seconds between retries
    refetchOnWindowFocus: false, // Prevent refetch on window focus to reduce API calls
  })
}
